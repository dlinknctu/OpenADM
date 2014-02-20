#!/usr/bin/python
# Copyright 2012 William Yu
# wyu@ateneo.edu
#
# This file is part of POX.
#
# POX is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# POX is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with POX. If not, see <http://www.gnu.org/licenses/>.
#

"""
This is a demonstration file created to show how to obtain flow 
and port statistics from OpenFlow 1.0-enabled switches. The flow
statistics handler contains a summary of web-only traffic.
"""

# standard includes
from pox.core import core
from pox.lib.util import dpidToStr
import pox.openflow.libopenflow_01 as of
from pox.lib.revent import EventMixin,Event
from pox.topology import *
from pox.lib.addresses import IPAddr
from pox.openflow.of_json import *
from pox.openflow.topology import OpenFlowTopology as openflowtopology
from pox.lib.packet.ethernet import *

log = core.getLogger()

storage_of_ports = []
storage_of_flows = []


# handler for timer function that sends the requests to all the
# switches connected to the controller.

# def _timer_func ():
#   for connection in core.openflow._connections.values():
#     print "======= connection ========"
#     print connection
    
#     connection.send(of.ofp_stats_request(body=of.ofp_flow_stats_request()))
#     connection.send(of.ofp_stats_request(body=of.ofp_port_stats_request()))
#   log.debug("Sent %i flow/port stats request(s)", len(core.openflow._connections))
#   # core.flow_stats.foo()
#   core.flow_stats.foo()  #invoke event 


# ====================================
#  create an user defined event
# ====================================
class StatsEvent (Event):

  def __init__ (self,flows =[],ports=[]):
    Event.__init__(self)
    self.flows_data = flows
    self.ports_data = ports


class flow_stats(EventMixin):
  _eventMixin_events = set([StatsEvent,])
  _core_name="flow_stats"
  def __init__(self,name = "flow_stats"):
    self.listenTo(core)

  def _handle_GoingUpEvent (self, event):
    self.listenTo(core.openflow)
    log.debug("Up...")

  def _raise_StatsEvent(self):
    
    ports_data = storage_of_ports[:]
    flows_data = storage_of_flows[:] 
    self.raiseEvent(StatsEvent,flows=flows_data,ports=ports_data)
    # clean
    storage_of_flows[:] = []
    storage_of_ports[:] = []

  def _send_ofp_stats_request (self):
    for connection in core.openflow._connections.values():      
      connection.send(of.ofp_stats_request(body=of.ofp_flow_stats_request()))
      connection.send(of.ofp_stats_request(body=of.ofp_port_stats_request()))
    log.debug("Sent %i flow/port stats request(s)", len(core.openflow._connections))
    core.flow_stats._raise_StatsEvent()  #invoke event 





# ============================================
#     action_type's transformation
#     defined in openflow spec 1.1 p.31
# ============================================

def ofp_action_type(number):
  if(number == 0):return "OUTPUT"
  elif(number == 1):return "SET_VLAN_VID"
  elif(number == 2):return "SET_VLAN_PCP"
  elif(number == 3):return "SET_DL_SRC"
  elif(number == 4):return "SET_DL_DST"
  elif(number == 5):return "SET_NW_SRC"
  elif(number == 6):return "SET_NW_DST"
  elif(number == 7):return "SET_NW_TOS"
  elif(number == 8):return "SET_NW_ECN"
  elif(number == 9):return "SET_TP_SRC"
  elif(number == 10):return "SET_TP_DST"
  elif(number == 11):return "COPY_TTL_OUT"
  elif(number == 12):return "COPY_TTL_IN"
  elif(number == 13):return "SET_MPLS_LABEL"
  elif(number == 14):return "SET_MPLS_TC"
  elif(number == 15):return "SET_MPLS_TTL"
  elif(number == 16):return "DEC_MPLS_TTL"
  elif(number == 17):return "PUSH_VLAN"
  elif(number == 18):return "POP_VLAN"
  elif(number == 19):return "PUSH_MPLS"
  elif(number == 20):return "POP_MPLS"
  elif(number == 21):return "SET_QUEUE"
  elif(number == 22):return "GROUP"
  elif(number == 23):return "SET_NW_TTL"
  elif(number == 24):return "DEC_NW_TTL"
  elif(number == 0xffff):return "EXPERIMENTER"



# structure of event.stats is defined by ofp_flow_stats()
def _handle_flowstats_received (event):
  stats = flow_stats_to_list(event.stats)
  log.debug("FlowStatsReceived from %s: %s", 
    dpidToStr(event.connection.dpid), stats)

  flows_dpid = {}
  flows_list = []

  for f in event.stats:

    flows = {}
    actions = []
    actions_dict = {}

    flows['wildcards'] = f.match.wildcards
    flows['dstIP'] = str(f.match.nw_dst)
    flows['dstIPMask'] =  0          # f.match.nw_dst_mask  not found
    flows['srcMac'] = str(f.match.dl_src)
    flows['counterByte'] = f.byte_count
    
    if f.match.tp_src == None:
      flows['srcPort'] = 0
    else:
      flows['srcPort'] = f.match.tp_src
    
    flows['ingreePort'] = f.match.in_port
    flows['dstMac'] = str(f.match.dl_dst)
    
    actions_dict['type'] = ofp_action_type(f.actions[0].type)
    actions_dict['value'] = f.actions[0].port
    actions.append(actions_dict)
    
    flows['actions'] = actions
    flows['srcIPMask'] = 0            #  f.match.nw_src_mask   not found
    flows['priority'] = f.priority
    flows['srcIP'] = str(f.match.nw_src)
    flows['vlan'] = f.match.dl_vlan    
    flows['counterPacket'] = f.packet_count
    
    if f.match.tp_dst == None :
      flows['dstPort'] = 0
    else :
      flows['dstPort'] = f.match.tp_dst
    
    flows['hardTimeout'] = f.hard_timeout
    flows['idleTimeout'] = f.idle_timeout
    flows['netProtocol'] = f.match.nw_proto


    flows_list.append(flows)
    # print flows
  
  flows_dpid['flows'] = flows_list
  flows_dpid['dpid'] = "00:00:" + dpidToStr(event.connection.dpid).replace('-',':')
  storage_of_flows.append(flows_dpid)


# handler to display port statistics received in JSON format
def _handle_portstats_received (event):
  stats = flow_stats_to_list(event.stats)
  
  ports_dpid = {}
  ports_list = []

  for p in stats:

    ports = {}   
    ports['recvPackets'] = p['rx_packets']
    ports['transmitPackets'] = p['tx_packets']
    ports['transmitBytes'] = p['tx_bytes']
    ports['PortNumber'] = p['port_no']
    ports['recvBytes'] = p['rx_bytes']

  
    ports_list.append(ports)

  ports_dpid['ports'] = ports_list
  ports_dpid['dpid'] = "00:00:" + dpidToStr(event.connection.dpid).replace('-',':')
  storage_of_ports.append(ports_dpid)

  log.debug("PortStatsReceived from %s: %s", 
    dpidToStr(event.connection.dpid), stats)



# main function to launch the module
def launch ():
  core.registerNew(flow_stats)  
  # attach handsers to listners
  core.openflow.addListenerByName("FlowStatsReceived", 
    _handle_flowstats_received) 
  core.openflow.addListenerByName("PortStatsReceived", 
    _handle_portstats_received)
