import pox
import pox.openflow.libopenflow_01 as of
from pox.core import core
from pox.lib.revent import *
from pox.lib.addresses import *
from pox.lib.util import *

log = core.getLogger()

class flow_modify (EventMixin):
  def __init__ (self):
    self.listenTo(core)


  def _handle_GoingUpEvent (self, event):

    self.listenTo(core.FlowModEvent_Generator)
    log.debug("Up...")

  def _handle_FlowModEvent (self, event):

    self.payload = event.payload
    self._parse_json_format()
    return

  def _parse_json_format(self):

  	command = self.payload['command']

  	if command == "MOD_ST":
  	  self._modify_flow("MOD_ST")
  	elif command == "DEL_ST":
  	  self._delete_flow("DEL_ST")
  	elif command == "MOD":
  	  self._modify_flow("MOD")
  	elif command == "DEL":
  	  self._delete_flow("DEL")


  def _modify_flow(self,command_type):
    
    msg = of.ofp_flow_mod()
    print self.payload
    if command_type == "MOD_ST":
      msg.command = of.OFPFC_MODIFY_STRICT
    elif command_type == "MOD":
      msg.command = of.OFPFC_MODIFY

    if self.payload.has_key("wildcards"):
      msg.match.wildcards = int(self.payload['wildcards'])
    
    if self.payload.has_key("dstIP"):
      msg.match.nw_dst = IPAddr(self.payload['dstIP'])
    
    if self.payload.has_key("srcMac"):
      msg.match.dl_src = EthAddr(self.payload['srcMac'])
    
    if self.payload.has_key("srcIP"):
      msg.match.nw_src = IPAddr(self.payload['srcIP'])
    
    if self.payload.has_key("dstMac"):
      msg.match.dl_dst = EthAddr(self.payload['dstMac'])
    
    if self.payload.has_key("hardTimeout"):
      msg.hard_timeout = int(self.payload['hardTimeout'])
    
    if self.payload.has_key("srcPort"):
      msg.match.tp_src = int(self.payload['srcPort'])
    
    if self.payload.has_key("priority"):
      msg.priority = int(self.payload['priority'])
    
    if self.payload.has_key("ingressPort"):
      msg.match.in_port = int(self.payload['ingressPort'])
    
    if self.payload.has_key("vlan"):
      msg.match.dl_vlan = int(self.payload['vlan'])
    
    if self.payload.has_key("ether-type"):
      msg.match.dl_type = int(self.payload['ether-type'])
    
    if self.payload.has_key("duration"):
      msg.duration_sec = int(self.payload['duration'])
    
    if self.payload.has_key("idleTimeout"):
      msg.idle_timeout = int(self.payload['idleTimeout'])
    
    if self.payload.has_key("netProtocol"):
      msg.match.nw_proto = int(self.payload['netProtocol'])


    self.dpid = self.payload['switch'].replace(':','-')[6:]
    self._parse_actions(self.payload['actions'])

    for connection in core.openflow._connections.values() :

      # print dpidToStr(connection.dpid)
      conn_dpid = str(dpidToStr(connection.dpid))
      print conn_dpid
      if conn_dpid == self.dpid:
        """match actions"""
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

        connection.send(msg)
              
        
  def _delete_flow(self,command_type):

    msg = of.ofp_flow_mod()
    if command_type == "DEL_ST":
      msg.command = of.OFPFC_DELETE_STRICT
    elif command_type == "DEL":
      msg.command = of.OFPFC_DELETE

    if self.payload.has_key("wildcards"):
      msg.match.wildcards = int(self.payload['wildcards'])
    
    if self.payload.has_key("dstIP"):
      msg.match.nw_dst = IPAddr(self.payload['dstIP'])
    
    if self.payload.has_key("srcMac"):
      msg.match.dl_src = EthAddr(self.payload['srcMac'])
    
    if self.payload.has_key("srcIP"):
      msg.match.nw_src = IPAddr(self.payload['srcIP'])
    
    if self.payload.has_key("dstMac"):
      msg.match.dl_dst = EthAddr(self.payload['dstMac'])
    
    if self.payload.has_key("hardTimeout"):
      msg.hard_timeout = int(self.payload['hardTimeout'])
    
    if self.payload.has_key("srcPort"):
      msg.match.tp_src = int(self.payload['srcPort'])
    
    if self.payload.has_key("priority"):
      msg.priority = int(self.payload['priority'])
    
    if self.payload.has_key("ingressPort"):
      msg.match.in_port = int(self.payload['ingressPort'])
    
    if self.payload.has_key("vlan"):
      msg.match.dl_vlan = int(self.payload['vlan'])
    
    if self.payload.has_key("ether-type"):
      msg.match.dl_type = int(self.payload['ether-type'])
    
    if self.payload.has_key("duration"):
      msg.duration_sec = int(self.payload['duration'])
    
    if self.payload.has_key("idleTimeout"):
      msg.idle_timeout = int(self.payload['idleTimeout'])
    
    if self.payload.has_key("netProtocol"):
      msg.match.nw_proto = int(self.payload['netProtocol'])

    self.dpid = self.payload['switch'].replace(':','-')[6:]
    print "===",self.dpid

    for connection in core.openflow._connections.values() :

      conn_dpid = str(dpidToStr(connection.dpid))
      # print conn_dpid
      if conn_dpid == self.dpid:
        connection.send(msg)
              

  def _parse_actions(self,actions):
    _actions = actions.replace(' ','')
    self.actions = _actions.split('=')[0]
    if self.actions != "strip-vlan":
      self.actions_argu = _actions.split('=')[1]
    



def launch ():
  core.registerNew(flow_modify)