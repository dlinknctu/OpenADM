import json
import sys
import ast
import logging as LOG
from webob import Response
from ryu.app.wsgi import ControllerBase, WSGIApplication, route
from ryu.base import app_manager
from ryu.controller import ofp_event
from ryu.controller import dpset
from ryu.controller.handler import MAIN_DISPATCHER
from ryu.controller.handler import set_ev_cls
from ryu.lib import dpid as dpid_lib
from ryu.ofproto import ofproto_v1_0
from ryu.ofproto import ofproto_v1_2
from ryu.ofproto import ofproto_v1_3
from ryu.lib import ofctl_v1_0
from ryu.lib import ofctl_v1_2
from ryu.lib import ofctl_v1_3
from ryu.lib.dpid import dpid_to_str
from ryu.topology.api import get_switch, get_link

class OmniUI(app_manager.RyuApp):
    _CONTEXTS = {
        'wsgi': WSGIApplication,
        'dpset': dpset.DPSet
    }
    def __init__(self, *args, **kwargs):
        super(OmniUI, self).__init__(*args, **kwargs)
        wsgi = kwargs['wsgi']
        #wsgi.register(RestController, {'omniui': self})
        self.waiters = {}
        self.data = {}
        self.data['dpset'] = kwargs['dpset']
        self.data['waiters'] = self.waiters
        self.data['omniui'] = self
        mapper = wsgi.mapper
        wsgi.registory['RestController'] = self.data

        mapper.connect('omniui', '/wm/omniui/switch/json',
                       controller=RestController, action='switches',
                       conditions=dict(method=['GET']))
        mapper.connect('omniui', '/wm/omniui/link/json',
                       controller=RestController, action='links',
                       conditions=dict(method=['GET']))
        mapper.connect('omniui', '/wm/omniui/add/json',
                       controller=RestController, action='mod_flow_entry',
                       conditions=dict(method=['POST']))

    @set_ev_cls([ofp_event.EventOFPFlowStatsReply, ofp_event.EventOFPPortStatsReply], MAIN_DISPATCHER)
    def stats_reply_handler(self, ev):
        msg = ev.msg
        dp = msg.datapath

        if dp.id not in self.waiters:
            return
        if msg.xid not in self.waiters[dp.id]:
            return
        lock, msgs = self.waiters[dp.id][msg.xid]
        msgs.append(msg)

        flags = 0
        if dp.ofproto.OFP_VERSION == ofproto_v1_0.OFP_VERSION:
            flags = dp.ofproto.OFPSF_REPLY_MORE
        elif dp.ofproto.OFP_VERSION == ofproto_v1_2.OFP_VERSION:
            flags = dp.ofproto.OFPSF_REPLY_MORE
        elif dp.ofproto.OFP_VERSION == ofproto_v1_3.OFP_VERSION:
            flags = dp.ofproto.OFPMPF_REPLY_MORE

        if msg.flags & flags:
            return
        del self.waiters[dp.id][msg.xid]
        lock.set()

class RestController(ControllerBase):
    def __init__(self, req, link, data, **config):
        super(RestController, self).__init__(req, link, data, **config)
        self.omniui = data['omniui']
        self.dpset = data['dpset']
        self.waiters = data['waiters']

    # return dpid of all nodes
    def getNodes(self):
        return self.dpset.dps.keys()

    # return flow table of specific dpid
    def getFlows(self, dpid):
        flow = {}
        dp = self.dpset.get(int(dpid))
        if dp is None:
            return None
        if dp.ofproto.OFP_VERSION == ofproto_v1_0.OFP_VERSION:
            flows = ofctl_v1_0.get_flow_stats(dp, self.waiters, flow)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_2.OFP_VERSION:
            flows = ofctl_v1_2.get_flow_stats(dp, self.waiters, flow)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_3.OFP_VERSION:
            flows = ofctl_v1_3.get_flow_stats(dp, self.waiters, flow)
        else:
            LOG.debug('Unsupported OF protocol')
            return None
        return flows

    # return port information of specific dpid
    def getPorts(self, dpid):
        dp = self.dpset.get(int(dpid))
        if dp is None:
            return None
        if dp.ofproto.OFP_VERSION == ofproto_v1_0.OFP_VERSION:
            ports = ofctl_v1_0.get_port_stats(dp, self.waiters)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_2.OFP_VERSION:
            ports = ofctl_v1_2.get_port_stats(dp, self.waiters)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_3.OFP_VERSION:
            ports = ofctl_v1_3.get_port_stats(dp, self.waiters)
        else:
            LOG.debug('Unsupported OF protocol')
            return None
        return ports

    # return links in network topology
    # notice: --observe-link is needed when running ryu-manager
    def getLinks(self):
        dpid = None
        links = get_link(self.omniui, dpid)
        return links

    # repack switch information
    def switches(self, req, **kwargs):
        result = []
        nodes = self.getNodes()
        for node in nodes:
            omniNode = {
                'dpid': self.colonDPID(dpid_to_str(node)),
                'flows':[],
                'ports':[]
            }
            # repack flow information
            flows = self.getFlows(node)
            for key in flows:
                for flow in flows[key]:
                    omniFlow = {
                        'ingressPort': flow['match']['in_port'] if 'in_port' in flow['match'] else 0,
                        'srcMac': flow['match']['dl_src'] if 'dl_src' in flow['match'] else 0,
                        'dstMac': flow['match']['dl_dst'] if 'dl_dst' in flow['match'] else 0,
                        'dstIP': flow['match']['nw_dst'] if 'nw_dst' in flow['match'] else 0,
                        'dstIPMask': '-', # not support in ryu
                        'netProtocol': flow['match']['nw_proto'] if 'nw_proto' in flow['match'] else 0,
                        'srcIP': flow['match']['nw_src'] if 'nw_src' in flow['match'] else 0,
                        'srcIPMask': '-', # not support in ryu
                        'dstPort': flow['match']['tp_dst'] if 'tp_dst' in flow['match'] else 0,
                        'srcPort': flow['match']['tp_src'] if 'tp_src' in flow['match'] else 0,
                        'vlan': flow['match']['dl_vlan'] if 'dl_vlan' in flow['match'] else 0,
                        'vlanP': flow['match']['dl_vlan_pcp'] if 'dl_vlan_pcp' in flow['match'] else 0,
                        'wildcards': flow['match']['wildcards'] if 'wildcards' in flow['match'] else '-',
                        'tosBits': flow['match']['nw_tos'] if 'nw_tos' in flow['match'] else 0,
                        'counterByte': flow['byte_count'],
                        'counterPacket': flow['packet_count'],
                        'idleTimeout': flow['idle_timeout'],
                        'hardTimeout': flow['hard_timeout'],
                        'priority': flow['priority'],
                        'duration': flow['duration_sec'],
                        'dlType': flow['match']['dl_type'] if 'dl_type' in flow['match'] else 0,
                        'actions': []
                    }
                    # repack action field
                    for action in flow['actions']:
                        if (len(action.split(':')) == 1):
                            omniAction = {
                                'type': action,
                            }
                            omniFlow['actions'].append(omniAction)
                        else:
                            omniAction = {
                                'type': action.split(':')[0],
                                'value': action.split(':')[1]
                            }
                            omniFlow['actions'].append(omniAction)
                    omniNode['flows'].append(omniFlow)
            # repack port information
            ports = self.getPorts(node)
            for key in ports:
                for port in ports[key]:
                    omniPort = {
                        'PortNumber': port['port_no'],
                        'recvPackets': port['rx_packets'],
                        'transmitPackets': port['tx_packets'],
                        'recvBytes': port['rx_bytes'],
                        'transmitBytes': port['tx_bytes']
                    }
                    omniNode['ports'].append(omniPort)
            result.append(omniNode)
        body = json.dumps(result)
        return Response(content_type='application/json', body=body)

    # repack link information
    def links(self, req, **kwargs):
        result = []
        links = self.getLinks()
        for link in links:
            omniLink = {
                'src-switch': self.colonDPID(link.to_dict()['src']['dpid']),
                'dst-switch': self.colonDPID(link.to_dict()['dst']['dpid']),
                'src-port': (int)(link.to_dict()['src']['port_no']),
                'dst-port': (int)(link.to_dict()['dst']['port_no'])
            }
            # remove bi-direction link
            reverse = False
            for link in result:
                if (link['src-switch'] == omniLink['dst-switch'] and
                        link['dst-switch'] == omniLink['src-switch'] and
                        link['src-port'] == omniLink['dst-port'] and
                        link['dst-port'] == omniLink['src-port']):
                    reverse = True
            result.append(omniLink) if reverse is False else None
        body = json.dumps(result)
        return Response(content_type='application/json', body=body)

    def mod_flow_entry(self, req, **kwargs):
        try:
            omniFlow = ast.literal_eval(req.body)     #Getting flow from req
        except SyntaxError:
            LOG.debug('Invalid syntax %s', req.body)
            return Response(status=400)

        omniDpid = omniFlow.get('switch')             #Getting OmniUI dpid from flow    
        if omniDpid is None:
            return Response(status=404)
        else:
            dpid = self.nospaceDPID(omniDpid.split(':'))    #Split OmniUI dpid into a list

        cmd = omniFlow.get('command')                 #Getting OmniUI command from flow
        dp = self.dpset.get(int(dpid))                #Getting datapath from Ryu dpid
        if dp is None:                                #NB: convert dpid to int first
            return Response(status=404)

        if cmd == 'ADD':
            cmd = dp.ofproto.OFPFC_ADD
        elif cmd == 'MOD':
            cmd = dp.ofproto.OFPFC_MODIFY
        elif cmd == 'MOD_ST':
            cmd = dp.ofproto.OFPFC_MODIFY_STRICT
        elif cmd == 'DEL':
            cmd = dp.ofproto.OFPFC_DELETE
        elif cmd == 'DEL_ST':
            cmd = dp.ofproto.OFPFC_DELETE_STRICT
        else:
            return Response(status=404)

        if dp.ofproto.OFP_VERSION == ofproto_v1_0.OFP_VERSION:
            ryuFlow = self.ryuFlow_v1_0(dp, omniFlow)
            ofctl_v1_0.mod_flow_entry(dp, ryuFlow, cmd)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_2.OFP_VERSION:
            ofctl_v1_2.mod_flow_entry(dp, omniFlow, cmd)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_3.OFP_VERSION:
            ofctl_v1_3.mod_flow_entry(dp, omniFlow, cmd)
        else:
            return Response(status=404)

        return Response(status=200)

    # restore to Ryu Openflow v1.0 flow format
    def ryuFlow_v1_0(self, dp, flows):
        if flows.get('wildcards') == '-':
            wildcards = 0
        else:
            wildcards = flows.get('wildcards')

        ryuFlow = {
            'cookie': int(flows.get('cookie', 0)),
            'priority': int(flows.get('priority', dp.ofproto.OFP_DEFAULT_PRIORITY)),
            'buffer_id': int(flows.get('buffer_id', dp.ofproto.OFP_NO_BUFFER)),
            'out_port': int(flows.get('out_port', dp.ofproto.OFPP_NONE)),
            'flags': int(flows.get('flags', 0)),
            'idle_timeout': int(flows.get('idleTimeout', 0)),
            'hard_timeout': int(flows.get('hardTimeout', 0)),
            'actions': [],
            'match': {
                'wildcards': wildcards,
                'in_port': int(flows.get('ingressPort', 0)),
                'dl_src': flows.get('srcMac'),
                'dl_dst': flows.get('dstMac'),
                'dl_vlan': int(flows.get('vlan', 0)),
                'dl_vlan_pcp': int(flows.get('vlanP', 0)),
                'dl_type': int(flows.get('dlType', 0)),
                'nw_tos': int(flows.get('tosBits', 0)),
                'nw_proto': int(flows.get('netProtocol', 0)),
                'nw_src': flows.get('srcIP').split('/')[0],
                'nw_dst': flows.get('dstIP').split('/')[0],
                'tp_src': int(flows.get('srcPort', 0)),
                'tp_dst': int(flows.get('dstPort', 0))
            }
        }
        actions = flows.get('actions')
        if actions is not None:
            actions = flows.get('actions').split(',')
            for act in actions:
                action = self.to_action(dp, act)
                ryuFlow['actions'].append(action)

        return ryuFlow

    def to_action(self, dp, actions):
        actions_type = actions.split('=')[0]
        if actions_type == 'OUTPUT':
            ryuAction = {
                'type': actions_type,
                'port': actions.split('=')[1],
                'max_len': 0xffe5
            }
        elif actions_type == 'SET_VLAN_VID':
            ryuAction = {
                'type': actions_type,
                'vlan_vid': actions.split('=')[1]
            }
        elif actions_type == 'SET_VLAN_PCP':
            ryuAction = {
                'type': actions_type,
                'vlan_pcp': actions.split('=')[1]
            }
        elif actions_type == 'STRIP_VLAN':
            ryuAction = {
                'type': actions_type
            }
        elif actions_type == 'SET_DL_SRC':
            ryuAction = {
                'type': actions_type,
                'dl_src': actions.split('=')[1]
            }
        elif actions_type == 'SET_DL_DST':
            ryuAction = {
                'type': actions_type,
                'dl_dst': actions.split('=')[1]
            }
        elif actions_type == 'SET_NW_SRC':
            ryuAction = {
                'type': actions_type,
                'nw_src': actions.split('=')[1]
            }
        elif actions_type == 'SET_NW_DST':
            ryuAction = {
                'type': actions_type,
                'nw_dst': actions.split('=')[1]
            }
        elif actions_type == 'SET_NW_TOS':
            ryuAction = {
                'type': actions_type,
                'nw_tos': actions.split('=')[1]
            }
        elif actions_type == 'SET_TP_SRC':
            ryuAction = {
                'type': actions_type,
                'tp_src': actions.split('=')[1]
            }
        elif actions_type == 'SET_TP_DST':
            ryuAction = {
                'type': actions_type,
                'tp_dst': actions.split('=')[1]
            }
        elif actions_type == 'ENQUEUE':
            actions_port = actions.split('=')[1].split(':')[0]
            actions_qid = actions.split('=')[1].split(':')[1]
            ryuAction = {
                'type': actions_type,
                'port': actions_port,
                'queue_id': actions_qid
            }
        else:
            LOG.debug('Unknown action type')

        return ryuAction

    # restore Ryu-format dpid
    def nospaceDPID(self, dpid):
        return "".join(dpid)

    # repack dpid
    def colonDPID(self, dpid):
        return ':'.join(a+b for a,b in zip(dpid[::2], dpid[1::2]))
