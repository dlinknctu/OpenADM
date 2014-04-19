/*
 * Author: TeYen Liu
 *
 * Copyright (C) 2013 TeYen Liu
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2, as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


#include <assert.h>
#include <inttypes.h>
#include <signal.h>
#include <errno.h>
#include "trema.h"
#include "simple_restapi_manager.h"
#include "json.h"

int isdone=false;
list_element *switches;
json_object* response = NULL;
int uds_count,uds_current_count=0;
int set_oxm_matches_from_json(oxm_matches* match,char* request_data);
int send_uds_flow(uint64_t datapath_id, char* request_data);
int delete_uds_flow(uint64_t datapath_id, char* request_data);
int get_uds_flow(uint64_t datapath_id, char* request_data);
uint64_t dpid_from_string(char* input);
void dpid_from_uint64(char* ans,uint64_t input);
void handle_multipart_reply_flow(uint64_t datapath_id,  struct ofp_flow_stats *data,   uint16_t body_length);
void add_int_to_json(const char*name,int input,json_object* obj);
void add_uint64_to_json(const char* name,uint64_t  input, json_object* obj);


/********************************
 * convert dpif string to int
 * ex: 00:33:44:55:22:55 -> 220189762133
 *
 *******************************/

uint64_t dpid_from_string(char* input){
    char *buf;
    uint64_t num = 0;
    buf = strtok(input,":");
    while(buf!=NULL){
        int a = strtol(buf,NULL,16);
        num = (num<<8) + a;
        buf = strtok(NULL,":");
    }
	return num;
}

/********************************
 * convert dpif  int to string
 * ex: 220189762133 -> 00:33:44:55:22:55
 *
 *******************************/
void dpid_from_uint64(char* ans,uint64_t input){
	uint64_t mask,tmp,j;
    int i=0;
    mask = 0xffff000000000000;
    for(i=0;i<8;i++){
        tmp = (input & mask) >> ((7-i)*8);
        mask = mask >> 8;
        j = tmp/16;
        ans[i*3] = j > 10? j+'a' : j+'0';
        j = tmp%16;
        ans[i*3+1] = j > 10? j+'a' : j+'0';
        ans[i*3+2] = ':';
    }
    ans[23]=0;
}




/******************************************************************
 *  _     ___ _   _ _  __  _     ___ ____ _____
 * | |   |_ _| \ | | |/ / | |   |_ _/ ___|_   _|
 * | |    | ||  \| | ' /  | |    | |\___ \ | |
 * | |___ | || |\  | . \  | |___ | | ___) || |
 * |_____|___|_| \_|_|\_\ |_____|___|____/ |_|
 *
 *****************************************************************/


static void
create_switches( list_element **switches ) {
  create_list( switches );
}


static void
delete_switches( list_element *switches ) {
  list_element *element;
  for ( element = switches; element != NULL; element = element->next ) {
    if ( element->data != NULL ) {
      xfree( element->data );
    }
  }
  delete_list( switches );
}


static void 
insert_datapath_id( list_element **switches, uint64_t datapath_id ) {
  list_element *element = NULL;
  for ( element = *switches; element != NULL; element = element->next ) {
    if ( *( ( uint64_t * ) element->data ) > datapath_id ) {
      break;
    }
    if ( *( ( uint64_t * ) element->data ) == datapath_id ) {
      // already exists
      return;
    }
  }
  uint64_t *new = xmalloc( sizeof( uint64_t ) );
  *new = datapath_id;
  if ( element == NULL ) {
    append_to_tail( switches, new );
  }
  else if ( element == *switches ) {
    insert_in_front( switches, new );
  }
  else {
    insert_before( switches, element->data, new );
  }
}


static void
delete_datapath_id( list_element **switches, uint64_t datapath_id ) {
  list_element *element = NULL;
  for ( element = *switches; element != NULL; element = element->next ) {
    if ( *( ( uint64_t * ) element->data ) == datapath_id ) {
      void *data = element->data;
      delete_element( switches, data );
      xfree( data );
      return;
    }
  }
  // not found
}






/***************************************************
 *  _     _____    _    ____  _   _   ______        _____ _____ ____ _   _
 * | |   | ____|  / \  |  _ \| \ | | / ___\ \      / /_ _|_   _/ ___| | | |
 * | |   |  _|   / _ \ | |_) |  \| | \___ \\ \ /\ / / | |  | || |   | |_| |
 * | |___| |___ / ___ \|  _ <| |\  |  ___) |\ V  V /  | |  | || |___|  _  |
 * |_____|_____/_/   \_\_| \_\_| \_| |____/  \_/\_/  |___| |_| \____|_| |_|
 *
 *******************************************/


typedef struct {
  struct key {
    uint8_t mac[ OFP_ETH_ALEN ];
    uint64_t datapath_id;
  } key;
  uint32_t port_no;
  time_t last_update;
} forwarding_entry;


time_t
now() {
  return time( NULL );
}


/********************************************************************************
 * packet_in event handler
 ********************************************************************************/

static const int MAX_AGE = 300;


static bool
aged_out( forwarding_entry *entry ) {
  if ( entry->last_update + MAX_AGE < now() ) {
    return true;
  }
  else {
    return false;
  };
}


static void
age_forwarding_db( void *key, void *forwarding_entry, void *forwarding_db ) {
  if ( aged_out( forwarding_entry ) ) {
    delete_hash_entry( forwarding_db, key );
    xfree( forwarding_entry );
  }
}


static void
update_forwarding_db( void *forwarding_db ) {
  foreach_hash( forwarding_db, age_forwarding_db, forwarding_db );
}


static void
learn( hash_table *forwarding_db, struct key new_key, uint32_t port_no ) {
  forwarding_entry *entry = lookup_hash_entry( forwarding_db, &new_key );

  if ( entry == NULL ) {
    entry = xmalloc( sizeof( forwarding_entry ) );
    memcpy( entry->key.mac, new_key.mac, OFP_ETH_ALEN );
    entry->key.datapath_id = new_key.datapath_id;
    insert_hash_entry( forwarding_db, &entry->key, entry );
  }
  entry->port_no = port_no;
  entry->last_update = now();
}


static void
do_flooding( packet_in packet_in, uint32_t in_port ) {
  openflow_actions *actions = create_actions();
  append_action_output( actions, OFPP_ALL, OFPCML_NO_BUFFER );

  buffer *packet_out;
  if ( packet_in.buffer_id == OFP_NO_BUFFER ) {
    buffer *frame = duplicate_buffer( packet_in.data );
    fill_ether_padding( frame );
    packet_out = create_packet_out(
      get_transaction_id(),
      packet_in.buffer_id,
      in_port,
      actions,
      frame
    );
    free_buffer( frame );
  }
  else {
    packet_out = create_packet_out(
      get_transaction_id(),
      packet_in.buffer_id,
      in_port,
      actions,
      NULL
    );
  }
  send_openflow_message( packet_in.datapath_id, packet_out );
  free_buffer( packet_out );
  delete_actions( actions );
}


static void
send_packet( uint32_t destination_port, packet_in packet_in, uint32_t in_port ) {
  openflow_actions *actions = create_actions();
  append_action_output( actions, destination_port, OFPCML_NO_BUFFER );

  openflow_instructions *insts = create_instructions();
  append_instructions_apply_actions( insts, actions );

  oxm_matches *match = create_oxm_matches();
  set_match_from_packet( match, in_port, NULL, packet_in.data );

  buffer *flow_mod = create_flow_mod(
    get_transaction_id(),
    get_cookie(),
    0,
    1,  //table id
    OFPFC_ADD,
    60,
    0,
    OFP_HIGH_PRIORITY,
    packet_in.buffer_id,
    0,
    0,
    OFPFF_SEND_FLOW_REM,
    match,
    insts
  );
  send_openflow_message( packet_in.datapath_id, flow_mod );
  free_buffer( flow_mod );
  delete_oxm_matches( match );
  delete_instructions( insts );

  if ( packet_in.buffer_id == OFP_NO_BUFFER ) {
    buffer *frame = duplicate_buffer( packet_in.data );
    fill_ether_padding( frame );
    buffer *packet_out = create_packet_out(
      get_transaction_id(),
      packet_in.buffer_id,
      in_port,
      actions,
      frame
    );
    send_openflow_message( packet_in.datapath_id, packet_out );
    free_buffer( packet_out );
    free_buffer( frame );
  }

  delete_actions( actions );
}


static void
handle_packet_in( uint64_t datapath_id, packet_in message ) {
  if ( message.data == NULL ) {
    error( "data must not be NULL" );
    return;
  }
  if ( !packet_type_ether( message.data ) ) {
    return;
  }

  uint32_t in_port = get_in_port_from_oxm_matches( message.match );
  if ( in_port == 0 ) {
    return;
  }

  struct key new_key;
  packet_info packet_info = get_packet_info( message.data );
  memcpy( new_key.mac, packet_info.eth_macsa, OFP_ETH_ALEN );
  new_key.datapath_id = datapath_id;
  hash_table *forwarding_db = message.user_data;
  learn( forwarding_db, new_key, in_port );

  struct key search_key;
  memcpy( search_key.mac, packet_info.eth_macda, OFP_ETH_ALEN );
  search_key.datapath_id = datapath_id;
  forwarding_entry *destination = lookup_hash_entry( forwarding_db, &search_key );

  if ( destination == NULL ) {
    do_flooding( message, in_port );
  }
  else {
    send_packet( destination->port_no, message, in_port );
  }
}


/********************************************************************************
 * Start learning_switch controller.
 ********************************************************************************/

static const int AGING_INTERVAL = 5;


unsigned int
hash_forwarding_entry( const void *key ) {
  return hash_mac( ( ( const struct key * ) key )->mac );
}


bool
compare_forwarding_entry( const void *x, const void *y ) {
  const forwarding_entry *ex = x;
  const forwarding_entry *ey = y;
  return ( memcmp( ex->key.mac, ey->key.mac, OFP_ETH_ALEN ) == 0 )
           && ( ex->key.datapath_id == ey->key.datapath_id );
}


static void
handle_switch_ready( uint64_t datapath_id, void *user_data ) {
  UNUSED( user_data );
  info( "%#" PRIx64 " is connected.", datapath_id );
  uds_current_count+=1;
  //add datapath
  list_element **switches = user_data;
  insert_datapath_id( switches, datapath_id );
  
  openflow_actions *actions = create_actions();
  append_action_output( actions, OFPP_CONTROLLER, OFPCML_NO_BUFFER );

  openflow_instructions *insts = create_instructions();
  append_instructions_apply_actions( insts, actions );

  buffer *flow_mod = create_flow_mod(
    get_transaction_id(),
    get_cookie(),
    0,
    1, //table id = 1
    OFPFC_ADD,
    0,
    0,
    OFP_LOW_PRIORITY,
    OFP_NO_BUFFER,
    0,
    0,
    OFPFF_SEND_FLOW_REM,
    NULL,
    insts
  );
  send_openflow_message( datapath_id, flow_mod );
  free_buffer( flow_mod );
  delete_instructions( insts );
  delete_actions( actions );
}


/**************************************
 *  ____  _____ ____ _____ _____ _   _ _          _    ____ ___
 * |  _ \| ____/ ___|_   _|  ___| | | | |        / \  |  _ \_ _|
 * | |_) |  _| \___ \ | | | |_  | | | | |       / _ \ | |_) | |
 * |  _ <| |___ ___) || | |  _| | |_| | |___   / ___ \|  __/| |
 * |_| \_\_____|____/ |_| |_|    \___/|_____| /_/   \_\_|  |___|
 *
 *********************************************/


/*
 *  Add Uds
 *
 */

static char *
handle_query_add_uds( const struct mg_request_info *request_info, void *request_data, void *retcode ) {
	char dpid[30];
	memset(dpid,0,sizeof(dpid));
	memcpy(dpid,&request_info->uri[9],strlen(request_info->uri)-8);
	send_uds_flow(dpid_from_string(dpid),request_data);
	(*(int*)retcode)=200;
	return "OK";
}

static char *
handle_query_add_uds_all( const struct mg_request_info *request_info, void *request_data,void *retcode) {
	UNUSED(request_info);
	int err;
	const list_element *element;
	for ( element = switches; element != NULL; element = element->next ) {
		err = send_uds_flow( *(uint64_t*)element->data,request_data);
		switch(err){
			case -1:
				return "json format error\n";
			case 0:
				break;
		}
	}
	*((int*)retcode)=200;
	return "OK";
}

/*
 *  Del UDS
 *
 */

static char *
handle_query_del_uds( const struct mg_request_info *request_info, void *request_data, void *retcode) {
	char dpid[30];
	memset(dpid,0,sizeof(dpid));
	memcpy(dpid,&request_info->uri[9],strlen(request_info->uri)-8);
	delete_uds_flow(dpid_from_string(dpid),request_data);
	*((int*)retcode)=200;
	return "OK";
}


static char *
handle_query_del_uds_all( const struct mg_request_info *request_info, void *request_data, void* retcode ) {
	UNUSED(request_info);
	int err;
	const list_element *element;
	for ( element = switches; element != NULL; element = element->next ) {
		err = delete_uds_flow( *(uint64_t*)element->data,request_data);
		switch(err){
			case -1:
				return "json format error\n";
			case 0:
				break;
		}
	}
	*((int*)retcode)=200;
	return "OK";
}



/*
 *  Get UDS
 *
 */

static char *
handle_query_get_uds( const struct mg_request_info *request_info, void *request_data, void *retcode ) {
	int i;
	char dpid[30];
	memset(dpid,0,sizeof(dpid));
	memcpy(dpid,&request_info->uri[9],strlen(request_info->uri)-8);
	uds_count = 1;
	if( NULL != response){
		json_object_put(response);
		response = NULL;
	}
	isdone = false;
	get_uds_flow(dpid_from_string(dpid),request_data);
	for(i=0;i<10;i++){
		if(isdone){
			*((int*)retcode)=200;
			return json_object_to_json_string(response);
		}
		sleep(1);
	}
	*((int*)retcode)=404;
	return "timeout";
}


static char *
handle_query_get_uds_all( const struct mg_request_info *request_info, void *request_data, void *retcode ) {
	UNUSED(request_info);
	int err,i=0;
	const list_element *element;
	uds_count = uds_current_count ;
	if( NULL != response){
		json_object_put(response);
		response = NULL;
	}
	isdone = false;
	for ( element = switches; element != NULL; element = element->next ) {
		err = get_uds_flow( *(uint64_t*)element->data,request_data);
		switch(err){
			case -1:
				return "json format error\n";
			case 0:
				break;
		}
	}
	for(i=0;i<10;i++){
		if(isdone){
			*((int*)retcode)=200;
			return json_object_to_json_string(response);
		}
		sleep(1);
	}
	*((int*)retcode)=404;
	return "timeout";

}

/*
 *
 * Handle Multipart reply
 *
 */

void
handle_multipart_reply(  uint64_t datapath_id,   uint32_t transaction_id,   uint16_t type,   uint16_t flags,   const buffer *data,   void *user_data ) {
	
	buffer *body = NULL;
	void *multipart_data = NULL;
	uint16_t body_length = 0;
	UNUSED( user_data );
	UNUSED( flags );
	UNUSED( transaction_id );
/*
	printf( "[multipart_reply]" );
	printf( " datapath_id: %#" PRIx64, datapath_id );
	printf( " transaction_id: %#x", transaction_id );
	printf( " type: %#x", type );
	printf( " flags: %#x", flags );
	fflush(stdout);
*/

	if ( NULL != data) {
		body = duplicate_buffer( data );
		multipart_data = body->data;
		body_length = ( uint16_t ) body->length;
	}else{
		if( OFPMP_FLOW == type){
			if( 0 == --uds_count){

				isdone = true;
			}
		}
	}

	if ( NULL != body){
		switch(type){
			case OFPMP_FLOW:
				handle_multipart_reply_flow( datapath_id,(struct ofp_flow_stats *) multipart_data, body_length );
				break;
		}
	}
}


void
handle_multipart_reply_flow(uint64_t datapath_id,  struct ofp_flow_stats *data,   uint16_t body_length){
	struct ofp_flow_stats *stats = data;
	uint16_t rest_length = body_length;
	uint16_t match_len = 0;
	uint16_t match_pad_len = 0;
	uint16_t inst_len = 0;
	struct ofp_instruction *inst;
	int i = 0;
	char inst_str[ 4096 ],dpid[23];
	struct ofp_match *tmp_match;
	oxm_matches *tmp_matches;
	char match_str[ MATCH_STRING_LENGTH ];
	char *tmp,*tmp2;
	//json
	if(NULL == response){
		response = json_object_new_array();
	}
	dpid_from_uint64(dpid,datapath_id);
	json_object* datapath = json_object_new_string(dpid);
	json_object* data_flow = json_object_new_object();
	json_object* flows = json_object_new_array();
	json_object_object_add(data_flow,"datapath",datapath);
	while ( rest_length >= sizeof( struct ofp_flow_stats ) ) {
		json_object* flow = json_object_new_object();
		json_object *json_tmp;
		struct ofp_flow_stats *next;
		next = ( struct ofp_flow_stats * ) ( ( char * ) stats + stats->length );

		i++;
/*
		printf( "[multipart_reply_flow:%d]", i );
		printf( " length: %#x", stats->length );
		printf( " table_id: %#x", stats->table_id );
		printf( " duration_sec: %#x", stats->duration_sec );
		printf( " duration_nsec: %#x", stats->duration_nsec );
		printf( " priority: %#x", stats->priority );
		printf( " idle_timeout: %#x", stats->idle_timeout );
		printf( " hard_timeout: %#x", stats->hard_timeout );
		printf( " flags: %#x", stats->flags );
		printf( " cookie: %#" PRIx64, stats->cookie );
		printf( " packet_count: %#" PRIx64, stats->packet_count );
		printf( " byte_count: %#" PRIx64, stats->byte_count );
*/
		add_int_to_json("duration",(uint32_t)stats->duration_sec,flow);
		add_uint64_to_json("packet_count",stats->packet_count,flow);
		add_uint64_to_json("byte_count",stats->byte_count,flow);
		match_len = stats->match.length;
		match_pad_len = ( uint16_t ) ( match_len + PADLEN_TO_64( match_len ) );
		{
			tmp_match = xcalloc( 1, match_pad_len );
			hton_match( tmp_match, &stats->match );
			tmp_matches = parse_ofp_match( tmp_match );
			match_to_string( tmp_matches, match_str, sizeof( match_str ) );
			xfree( tmp_match );
			delete_oxm_matches( tmp_matches );
		}
		//printf( " match: [%s]\n", match_str );
		//parse match_str to json object
		//
		
		tmp = strtok(match_str,"= [],");
		
		while(NULL != tmp){
			tmp2 = strtok(NULL,"= [],");
			json_tmp = json_object_new_string(tmp2);
			json_object_object_add(flow,tmp,json_tmp);
			tmp = strtok(NULL,"= [],");
			fflush(stdout);
		}
		if ( stats->length > ( offsetof( struct ofp_flow_stats, match ) + match_pad_len ) ) {
			inst_len = ( uint16_t ) ( stats->length - ( offsetof( struct ofp_flow_stats, match ) + match_pad_len ) );
			inst = ( struct ofp_instruction * ) ( ( char * ) stats + offsetof( struct ofp_flow_stats, match ) + match_pad_len );
			instructions_to_string( inst, inst_len, inst_str, sizeof( inst_str ) );
		}
		rest_length = ( uint16_t ) ( rest_length - stats->length );
		stats = next;
		json_object_array_add(flows,flow);
	}
	json_object_object_add(data_flow,"flows",flows);
	json_object_array_add(response,data_flow);
	//printf ("The json object created: %s\n count = %d\n",json_object_to_json_string(response),uds_count);
	fflush(stdout);
	if( 0 == --uds_count){
		fflush(stdout);
		isdone = true;
	}
}
/*
 *  Mooooo
 *
 */

void add_int_to_json(const char*name,int input,json_object* obj){
    json_object* tmp = json_object_new_int(input);
    json_object_object_add(obj,name,tmp);
}
void add_uint64_to_json(const char* name,uint64_t  input, json_object* obj){
    char tmp[20];
    sprintf(tmp,"%" PRIu64,input);
    json_object* tmp_obj = json_object_new_string(tmp);
    json_object_object_add(obj,name,tmp_obj);
}


int send_uds_flow(uint64_t datapath_id, char* request_data){
	int err = 0;
	openflow_instructions *insts = create_instructions();
	append_instructions_goto_table(insts,1);

	oxm_matches *match = create_oxm_matches();
	err = set_oxm_matches_from_json(match,request_data);
	if(-1 == err){
		goto error;
	}
	buffer *flow_mod = create_flow_mod(
		get_transaction_id(),
		1,
		0,
		0,  //table id
		OFPFC_ADD,
		0,
		0,
		OFP_HIGH_PRIORITY,
		0, 
		0,
		0,
		OFPFF_SEND_FLOW_REM,
		match,
		insts
		);
	send_openflow_message( datapath_id, flow_mod );
	free_buffer( flow_mod );
error:
	delete_oxm_matches( match );
	delete_instructions( insts );
	return err;
}


int delete_uds_flow(uint64_t datapath_id, char* request_data){
	int err = 0;
	openflow_instructions *insts = create_instructions();
	append_instructions_goto_table(insts,1);
	oxm_matches *match = create_oxm_matches();
	err = set_oxm_matches_from_json(match,request_data);
	if(-1 == err){
		goto error;
	}
	buffer *flow_mod = create_flow_mod(
		get_transaction_id(),
		1,
		0,
		0,  //table id
		OFPFC_DELETE,
		0,
		0,
		OFP_HIGH_PRIORITY,
		OFP_NO_BUFFER, 
		OFPP_ANY,
		OFPG_ANY,
		0,
		match,
		NULL
	);
	send_openflow_message( datapath_id, flow_mod );
	free_buffer( flow_mod );
error:
	delete_oxm_matches( match );
	delete_instructions( insts );
	return err;
}


int get_uds_flow(uint64_t datapath_id, char* request_data){
	UNUSED(request_data);
	oxm_matches *match = create_oxm_matches();
	buffer* flow_multipart = create_flow_multipart_request(
			get_transaction_id(),
			0, // flags
			0, // table id
			OFPP_ANY,// out_port
			OFPG_ANY, // out_group
			1, // cookie
			0, // cookie mask
			match);
	send_openflow_message(datapath_id,flow_multipart);
	free_buffer(flow_multipart);
	delete_oxm_matches(match);
	return 0;
}


int set_oxm_matches_from_json(oxm_matches* oxm_match,char* request_data){
	int err = 0;
	json_object *new_obj,*match;
	json_object *data1,*data2;
    new_obj = json_tokener_parse(request_data);
	if(!json_object_object_get_ex(new_obj,"match",&match)){
		printf("parse match filed  error %s\n",json_object_get_string(new_obj));
  		err = -1;
		goto error;
	}
	// eth_type (hexdecimal) ex. 0x0806
	if(json_object_object_get_ex(match,"eth_type",&data1)){
		int eth_type;
		sscanf(json_object_get_string(data1),"0x%x",&eth_type);
		json_object_put(data1);
		append_oxm_match_eth_type(oxm_match,(uint16_t)eth_type);
	}
	// eth_src && eth_src_mask
    if(json_object_object_get_ex(match,"eth_src",&data1)){
		char eth_mac[OFP_ETH_ALEN],eth_mac_mask[OFP_ETH_ALEN];
		sscanf(json_object_get_string(data1), "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx", &eth_mac[0], &eth_mac[1], &eth_mac[2], &eth_mac[3], &eth_mac[4], &eth_mac[5]);
		json_object_put(data1);
		//Get eth_mac_mask
		if(json_object_object_get_ex(match,"eth_src_mask",&data2)){
			sscanf(json_object_get_string(data2), "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx", &eth_mac_mask[0], &eth_mac_mask[1], &eth_mac_mask[2], &eth_mac_mask[3], &eth_mac_mask[4], &eth_mac_mask[5]);
			json_object_put(data2);
		}	
		else{
			memset(eth_mac_mask,255,sizeof(eth_mac_mask));
		}
		append_oxm_match_eth_src(oxm_match,(uint8_t*)eth_mac,(uint8_t*)eth_mac_mask);
	}
	// eth_dst && eth_dst_mask
    if(json_object_object_get_ex(match,"eth_dst",&data1)){
		char eth_mac[OFP_ETH_ALEN],eth_mac_mask[OFP_ETH_ALEN];
		sscanf(json_object_get_string(data1), "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx", &eth_mac[0], &eth_mac[1], &eth_mac[2], &eth_mac[3], &eth_mac[4], &eth_mac[5]);
		json_object_put(data1);
		//Get eth_mac_mask
		if(json_object_object_get_ex(match,"eth_dst_mask",&data2)){
			sscanf(json_object_get_string(data2), "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx", &eth_mac_mask[0], &eth_mac_mask[1], &eth_mac_mask[2], &eth_mac_mask[3], &eth_mac_mask[4], &eth_mac_mask[5]);
			json_object_put(data2);
		}	
		else{
			memset(eth_mac_mask,255,sizeof(eth_mac_mask));
		}
		append_oxm_match_eth_dst(oxm_match,(uint8_t*)eth_mac,(uint8_t*)eth_mac_mask);
	}
	//in_port 
	if(json_object_object_get_ex(match,"in_port",&data1)){
		int in_port;
		in_port = json_object_get_int(data1);
		json_object_put(data1);
		append_oxm_match_in_port(oxm_match,(uint32_t)in_port);
	}
	//ipv4_src && ipv4_src_mask
	if(json_object_object_get_ex(match,"ipv4_src",&data1)){
		unsigned ip[5],mask[5];
		sscanf(json_object_get_string(data1),"%d.%d.%d.%d",&ip[0],&ip[1],&ip[2],&ip[3]);
		ip[4] = ip[0]<<24 | ip[1]<<16 | ip[2]<<8 | ip[3];
		json_object_put(data1);
		if(json_object_object_get_ex(match,"ipv4_src_mask",&data2)){
			sscanf(json_object_get_string(data2),"%d.%d.%d.%d",&mask[0],&mask[1],&mask[2],&mask[3]);
			mask[4] = mask[0]<<24 | mask[1]<<16 | mask[2]<<8 | mask[3];
			json_object_put(data2);
		}else{
			mask[4] = 0xffffffff;
		}
		append_oxm_match_eth_type(oxm_match, 0x0800 );
		append_oxm_match_ipv4_src(oxm_match,ip[4],mask[4]);
	}
	//ipv4_dst && ipv4_dst_mask
	if(json_object_object_get_ex(match,"ipv4_dst",&data1)){
		uint32_t ip[5],mask[5];
		sscanf(json_object_get_string(data1),"%d.%d.%d.%d",&ip[0],&ip[1],&ip[2],&ip[3]);
		ip[4] = ip[0]<<24 | ip[1]<<16 | ip[2]<<8 | ip[3];
		json_object_put(data1);
		if(json_object_object_get_ex(match,"ipv4_dst_mask",&data2)){
			sscanf(json_object_get_string(data2),"%d.%d.%d.%d",&mask[0],&mask[1],&mask[2],&mask[3]);
			mask[4] = mask[0]<<24 | mask[1]<<16 | mask[2]<<8 | mask[3];
			json_object_put(data2);
		}
		else{
			mask[4] = 0xffffffff;
		}
		append_oxm_match_eth_type(oxm_match, 0x0800 );
		append_oxm_match_ipv4_dst(oxm_match,ip[4],mask[4]);
	}
error:
	json_object_put(new_obj);
	return err;
}

/***************************************************/


int
main( int argc, char *argv[] ) {

	/* Initialize the Trema world */
	init_trema( &argc, &argv );

	create_switches( &switches );
	/* Init restapi manager */
	init_restapi_manager();

	/* Start restapi manager */
	start_restapi_manager();

	/*** Add your REST API ***/
	add_restapi_url( "^/uds/addall$", "PUT", handle_query_add_uds_all );
	add_restapi_url( "^/uds/add/", "PUT", handle_query_add_uds );
	add_restapi_url( "^/uds/delall$", "PUT", handle_query_del_uds_all );
	add_restapi_url( "^/uds/del/", "PUT", handle_query_del_uds );
	add_restapi_url( "^/uds/getall$", "GET", handle_query_get_uds_all );
	add_restapi_url( "^/uds/get/", "GET", handle_query_get_uds );
	set_multipart_reply_handler( handle_multipart_reply, NULL );
	/*************************/

	/* Set switch ready handler  (learning switch)*/
	hash_table *forwarding_db = create_hash( compare_forwarding_entry, hash_forwarding_entry );
	add_periodic_event_callback( AGING_INTERVAL, update_forwarding_db, forwarding_db );
	set_packet_in_handler( handle_packet_in, forwarding_db );
	set_switch_ready_handler( handle_switch_ready, &switches );
	
	

	/* Main loop */
	start_trema();

	/* Finalize transaction manager */
	finalize_restapi_manager();

	return 0;
}



/*
 * Local variables:
 * c-basic-offset: 2
 * indent-tabs-mode: nil
 * End:
 */
