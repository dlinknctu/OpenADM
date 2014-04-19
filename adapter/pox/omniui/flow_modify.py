import pox
import pox.openflow.libopenflow_01 as of
from pox.core import core
from pox.lib.revent import *
from pox.lib.addresses import *
from pox.lib.util import *

log = core.getLogger()

Addxid = 0
Modifyxid = 0
Deletexid = 0



class ReplyEvent (Event):
  def __init__ (self, reply):
    Event.__init__(self)
    self.reply = reply



class flow_modify (EventMixin):
  _eventMixin_events = set([ReplyEvent,])
  def __init__ (self):
    self.listenTo(core)
    self._record_rules_dict = {}
    self._record_rules_list = []


  def _handle_GoingUpEvent (self, event):

    self.listenTo(core.FlowModEvent_Generator)
    log.debug("Up...")

  def _handle_FlowModEvent (self, event):

    self.payload = event.payload
    self._parse_json_format()
    return

  def _parse_json_format(self):

    command = self.payload['command']
    if command == "ADD":
      self._add_flow("ADD")
    elif command == "MOD_ST":
  	  self._modify_flow("MOD_ST")
    elif command == "DEL_ST":
  	  self._delete_flow("DEL_ST")
    elif command == "MOD":
  	  self._modify_flow("MOD")
    elif command == "DEL":
  	  self._delete_flow("DEL")

  def _add_flow(self,command_type):

    global Addxid 
    Addxid = of.generate_xid()
    msg = of.ofp_flow_mod()
    msg.command = of.OFPFC_ADD

    self._match_field(msg)
    # print "====mod payload ====\n",self.payload

    for connection in core.openflow._connections.values() :
      if str(dpidToStr(connection.dpid)) == self.dpid:
        
        """match actions"""
        self._match_action(msg)
        connection.send(msg)

        barrier = of.ofp_barrier_request()
        barrier.xid = xid
        connection.send(barrier)

        # for recover
        self._record_rules(dpid = self.dpid , msg = msg)


  def _modify_flow(self,command_type):
    
    global Modifyxid 
    Modifyxid = of.generate_xid()
    msg = of.ofp_flow_mod()
    
    # print "====mod payload ====\n",self.payload
    
    if command_type == "MOD_ST":
      msg.command = of.OFPFC_MODIFY_STRICT
    elif command_type == "MOD":
      msg.command = of.OFPFC_MODIFY
    
    self._match_field(msg)

    for connection in core.openflow._connections.values() :

      if str(dpidToStr(connection.dpid)) == self.dpid:
        """match actions"""
        self._match_action(msg)
        connection.send(msg)

        barrier = of.ofp_barrier_request()
        barrier.xid = xid
        connection.send(barrier)

        # for recover
        self._record_rules(dpid = self.dpid , msg = msg)
              
        
  def _delete_flow(self,command_type):
    
    Deletexid = of.generate_xid()
    msg = of.ofp_flow_mod()
    if command_type == "DEL_ST":
      msg.command = of.OFPFC_DELETE_STRICT
    elif command_type == "DEL":
      msg.command = of.OFPFC_DELETE
  
    # print "=== del payload ===\n",self.payload    
    self._match_field(msg)

    for connection in core.openflow._connections.values() :

      if str(dpidToStr(connection.dpid)) == self.dpid:
        connection.send(msg)

        barrier = of.ofp_barrier_request()
        barrier.xid = xid
        connection.send(barrier)

        # for recover
        self._record_rules(dpid = self.dpid , msg = msg)
              

  def _parse_actions(self,actions):
    _actions = actions.replace(' ','')
    self.actions = _actions.split('=')[0]
    if self.actions != "strip-vlan":
      self.actions_argu = _actions.split('=')[1]
   
  def _match_field(self,msg):

    if self.payload.has_key("wildcards"):
      msg.match.wildcards = int(self.payload['wildcards'])
    
    if self.payload.has_key("dstIP"):
      msg.match.nw_dst = IPAddr (str(self.payload['dstIP']).split('/')[0])
      msg.match.wildcards = msg.match.wildcards & (((32 - int(str(self.payload['dstIP']).split('/')[1]) ) << 8) | 0x3fc0ff )

    if self.payload.has_key("srcIP"):
      msg.match.nw_src = IPAddr (str(self.payload['dstIP']).split('/')[0])
      msg.match.wildcards = msg.match.wildcards & (((32 - int(str(self.payload['dstIP']).split('/')[1]) ) << 14) | 0x303fff )

    if self.payload.has_key("srcMac"):
      msg.match.dl_src = EthAddr(self.payload['srcMac'])
    
    if self.payload.has_key("dstMac"):
      msg.match.dl_dst = EthAddr(self.payload['dstMac'])
    
    if self.payload.has_key("hardTimeout"):
      msg.hard_timeout = int(self.payload['hardTimeout'])
    
    if self.payload.has_key("srcPort"):
      msg.match.tp_src = int(self.payload['srcPort'])
    
    if self.payload.has_key("dstPort"):
      msg.match.tp_dst = int(self.payload['dstPort'])
    
    if self.payload.has_key("priority"):
      msg.priority = int(self.payload['priority'])
    
    if self.payload.has_key("ingressPort"):
      msg.match.in_port = int(self.payload['ingressPort'])
    
    if self.payload.has_key("vlan"):
      msg.match.dl_vlan = int(self.payload['vlan'])
    
    if self.payload.has_key("dlType"):
      msg.match.dl_type = int(self.payload['dlType'])
    
    if self.payload.has_key("duration"):
      msg.duration_sec = int(self.payload['duration'])
    
    if self.payload.has_key("idleTimeout"):
      msg.idle_timeout = int(self.payload['idleTimeout'])
    
    if self.payload.has_key("netProtocol"):
      msg.match.nw_proto = int(self.payload['netProtocol'])
    
    if self.payload.has_key("tosBits"):
      msg.match.nw_tos=int(self.payload['tosBits'])  

    self.dpid = self.payload['switch'].replace(':','-')[6:]
    self._parse_actions(self.payload['actions'])


  def _match_action(self,msg):
    if(self.actions == "OUTPUT"):
      msg.actions.append(of.ofp_action_output(port = int(self.actions_argu)))
      
    elif(self.actions == "enqueue"):
      port = self.actions_argu.split(':')[0]
      queue_id = self.actions_argu.split(':')[1]
      msg.actions.append(of.ofp_action_enqueue(port = int(port) , queue_id = int(queue_id)))
    
    elif(self.actions == "strip-vlan"):
      msg.actions.append(of.ofp_action_strip_vlan())
    
    elif(self.actions == "set-vlan-id"):
      msg.actions.append(of.ofp_action_vlan_vid(vlan_vid = int(self.actions_argu)))
    
    elif(self.actions == "set-vlan-priority"):
      msg.actions.append(of.ofp_action_vlan_pcp(vlan_pcp = int(self.actions_argu)))
    
    elif(self.actions == "SET_DL_SRC"):
      msg.actions.append(of.ofp_action_dl_addr(type = 4 , dl_addr = EthAddr(self.actions_argu)))
    
    elif(self.actions == "SET_DL_DST"):
      msg.actions.append(of.ofp_action_dl_addr(type = 5 , dl_addr = EthAddr(self.actions_argu)))
    
    elif(self.actions == "SET_NW_TOS"):
      msg.actions.append(of.ofp_action_nw_tos(nw_tos = int(self.actions_argu)))

    elif(self.actions == "SET_NW_SRC"):
      msg.actions.append(of.ofp_action_nw_addr(type = 6 , nw_addr = IPAddr(self.actions_argu)))

    elif(self.actions == "SET_NW_DST"):
      msg.actions.append(of.ofp_action_nw_addr(type = 7 , nw_addr = IPAddr(self.actions_argu)))

    elif(self.actions == "SET_TP_SRC"):
      msg.actions.append(of.ofp_action_tp_port(type = 9 , tp_port = int(self.actions_argu)))
    
    elif(self.actions == "SET_TP_DST"):
      msg.actions.append(of.ofp_action_tp_port(type = 10 , tp_port = int(self.actions_argu)))

    

  def _record_rules(self,dpid,msg):
    self._record_rules_dict['dpid'] = dpid
    self._record_rules_dict['msg'] = msg
    self._record_rules_list.append(self._record_rules_dict)



# def _handle_BarrierIn(event):
#   global Addxid,Modifyxid,Deletexid
#   if Addxid == event.xid:
#     print "=== add event ===\n",event
#   elif Modifyxid == event.xid
#     print "=== modify event ===\n",event
#   elif Deletexid == event.xid
#     print "=== delete event ===\n",event 
    


def _raise_ReplyEvent(self):
  self.raiseEvent(ReplyEvent, reply)
  #   pass




"""reply status for deletion or modification or addition success or failure"""



              
  

def launch ():
  core.registerNew(flow_modify)
  # core.openflow.addListenerByName("BarrierIn", _handle_BarrierIn) 