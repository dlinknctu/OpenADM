import pox
import pox.openflow.libopenflow_01 as of
from pox.core import core
from pox.lib.revent import *
from pox.lib.addresses import *
from pox.lib.util import *

log = core.getLogger()

Barrier_Addxid = 0
Barrier_Modifyxid = 0
Barrier_Deletexid = 0
add_success = False
mod_success = False
del_success = False

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

    global Barrier_Addxid 
    msg = of.ofp_flow_mod()
    msg.command = of.OFPFC_ADD

    self._match_field(msg)

    for connection in core.openflow._connections.values() :
      if str(dpidToStr(connection.dpid)) == self.dpid:
        
        """match actions"""
        self._match_action(msg)
        connection.send(msg)
        barrier = of.ofp_barrier_request()
        barrier.xid = of.generate_xid()
        Barrier_Addxid = barrier.xid
        connection.send(barrier)
        # for recover
        self._record_rules(dpid = self.dpid , msg = msg)

  def _modify_flow(self,command_type):
    
    global Barrier_Modifyxid 
    msg = of.ofp_flow_mod()
    
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
        barrier.xid = of.generate_xid()
        Barrier_Modifyxid = barrier.xid
        connection.send(barrier)

        # for recover
        self._record_rules(dpid = self.dpid , msg = msg)
              
  def _delete_flow(self,command_type):
    
    global Barrier_Deletexid
    msg = of.ofp_flow_mod()

    if command_type == "DEL_ST":
      msg.command = of.OFPFC_DELETE_STRICT
    elif command_type == "DEL":
      msg.command = of.OFPFC_DELETE
  
    self._match_field(msg)

    for connection in core.openflow._connections.values() :

      if str(dpidToStr(connection.dpid)) == self.dpid:
        connection.send(msg)

        barrier = of.ofp_barrier_request()
        barrier.xid = of.generate_xid()
        Barrier_Deletexid = barrier.xid
        connection.send(barrier)

        # for recover
        self._record_rules(dpid = self.dpid , msg = msg)
              
  def _parse_actions(self,actions):
    _actions = actions.replace(' ','')
    self.actions = _actions.split(',')
   
  def _match_field(self,msg):

    if self.payload.has_key("wildcards"):
      msg.match.wildcards = int(self.payload['wildcards'])
    
    if self.payload.has_key("dstIP"):
      msg.match.nw_dst = IPAddr (str(self.payload['dstIP']).split('/')[0])
      msg.match.wildcards = msg.match.wildcards & 0x303fff | ((32 - int(str(self.payload['dstIP']).split('/')[1]) ) << 14)

    if self.payload.has_key("srcIP"):
      msg.match.nw_src = IPAddr (str(self.payload['srcIP']).split('/')[0])
      msg.match.wildcards = msg.match.wildcards & 0x3fc0ff | ((32 - int(str(self.payload['srcIP']).split('/')[1]) ) << 8)

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
    
    if self.payload.has_key("vlanP"):
      msg.match.dl_vlan_pcp = int(self.payload['vlanP'])
    
    if self.payload.has_key("dlType"):
      msg.match.dl_type = int(self.payload['dlType'])
    
    if self.payload.has_key("duration"):
      msg.duration_sec = int(self.payload['duration'])
    
    if self.payload.has_key("idleTimeout"):
      msg.idle_timeout = int(self.payload['idleTimeout'])
    
    if self.payload.has_key("netProtocol"):
      msg.match.nw_proto = int(self.payload['netProtocol'])
    
    if self.payload.has_key("tosBits"):
      msg.match.nw_tos = int(self.payload['tosBits'])  

    self.dpid = self.payload['switch'].replace(':','-')[6:]
    self._parse_actions(self.payload['actions'])

  def _match_action(self,msg):
    
      if len(self.actions) == 1 and self.actions[0] == "" :
          return

      for action in self.actions:
          
        action_name = action.split('=')[0]
        if action_name != "STRIP_VLAN":
            action_argu = action.split('=')[1]
        
        if(action_name == "OUTPUT"):
            msg.actions.append(of.ofp_action_output(port = int(action_argu)))
      
        elif(action_name == "ENQUEUE"):
            port = action_argu.split(':')[0]
            queue_id = action_argu.split(':')[1]
            msg.actions.append(of.ofp_action_enqueue(port = int(port) , queue_id = int(queue_id)))
    
        elif(action_name == "STRIP_VLAN"):
            msg.actions.append(of.ofp_action_strip_vlan())
    
        elif(action_name == "SET_VLAN_VID"):
            msg.actions.append(of.ofp_action_vlan_vid(vlan_vid = int(action_argu)))
    
        elif(action_name == "SET_VLAN_PCP"):
            msg.actions.append(of.ofp_action_vlan_pcp(vlan_pcp = int(action_argu)))
    
        elif(action_name == "SET_DL_SRC"):
            msg.actions.append(of.ofp_action_dl_addr(type = 4 , dl_addr = EthAddr(action_argu)))
    
        elif(action_name == "SET_DL_DST"):
            msg.actions.append(of.ofp_action_dl_addr(type = 5 , dl_addr = EthAddr(action_argu)))
    
        elif(action_name == "SET_NW_TOS"):
            msg.actions.append(of.ofp_action_nw_tos(nw_tos = int(action_argu)))

        elif(action_name == "SET_NW_SRC"):
            msg.actions.append(of.ofp_action_nw_addr(type = 6 , nw_addr = IPAddr(action_argu)))

        elif(action_name == "SET_NW_DST"):
            msg.actions.append(of.ofp_action_nw_addr(type = 7 , nw_addr = IPAddr(action_argu)))

        elif(action_name == "SET_TP_SRC"):
            msg.actions.append(of.ofp_action_tp_port(type = 9 , tp_port = int(action_argu)))
    
        elif(action_name == "SET_TP_DST"):
            msg.actions.append(of.ofp_action_tp_port(type = 10 , tp_port = int(action_argu)))

  def _record_rules(self,dpid,msg):

    self._record_rules_dict['dpid'] = dpid
    self._record_rules_dict['msg'] = msg
    self._record_rules_list.append(self._record_rules_dict)

  def check_barrierin(self):

    global add_success,mod_success,del_success

    if add_success:
        add_success = False
        return True
    elif mod_success:
        mod_success = False
        return True
    elif del_success:
        del_success = False
        return True
    else:
        return False

def _handle_BarrierIn(event):

  global add_success,mod_success,del_success

  if Barrier_Addxid == event.xid:
    add_success = True
  elif Barrier_Modifyxid == event.xid:
    mod_success = True
  elif Barrier_Deletexid == event.xid:
    del_success = True

def _raise_ReplyEvent(self):
  self.raiseEvent(ReplyEvent, reply)
  #   pass

"""reply status for deletion or modification or addition success or failure"""

def launch ():
  core.registerNew(flow_modify)
  core.openflow.addListenerByName("BarrierIn", _handle_BarrierIn) 
