import json
import sys
import ast
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

    @set_ev_cls([ofp_event.EventOFPFlowStatsReply,
                 ofp_event.EventOFPPortStatsReply,
                ], MAIN_DISPATCHER)
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
                    print flow['match']
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
                        'wildcards': '-', # not support in ryu
                        "tosBits": flow['match']['nw_tos'] if 'nw_tos' in flow['match'] else 0,
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
                if(link['src-switch'] == omniLink['dst-switch'] and
                                        link['dst-switch'] == omniLink['src-switch'] and
                                        link['src-port'] == omniLink['dst-port'] and
                                        link['dst-port'] == omniLink['src-port']):
                    reverse = True
            result.append(omniLink) if reverse is False else None
        body = json.dumps(result)
        return Response(content_type='application/json', body=body)
    
    # repack flow mod information
    def mod_flow_entry(self, req, **_kwargs):
        try:
            omniFlow = ast.literal_eval(req.body)
        except SyntaxError:
            LOG.debug('invalid syntax %s', req.body)
            return Response(status=400)

        switchID = omniFlow.get('switch')
        dpid = switchID.replace(":",'')
        dp = self.dpset.get(int(dpid))

        if dp is None:
            return Response(status=404)
       
        cmd = omniFlow.get('command')
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
        
        # repack Omniui Flow to Ryu Flow
        
        

        if dp.ofproto.OFP_VERSION == ofproto_v1_0.OFP_VERSION:
            ofctl_v1_0.mod_flow_entry(dp, ryuFlow, cmd)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_2.OFP_VERSION:
            ofctl_v1_2.mod_flow_entry(dp, ryuFlow, cmd)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_3.OFP_VERSION:
            ryuFlow = self.repack_flow_13(omniFlow, dp)
            ofctl_v1_3.mod_flow_entry(dp, ryuFlow, cmd)
        else:
            LOG.debug('Unsupported OF protocol')
            return Response(status=501)

        return Response(status=200)

    def repack_flow_13(self, omniFlow, dp):
    
        ryuFlow = {
            'cookie': int(omniFlow.get('cookie', 0)),
            'cookie_mask': int(omniFlow.get('cookie_mask', 0)),
            'table_id ': int(omniFlow.get('table_id', 0)),
            'idle_timeout': int(omniFlow.get('idleTimeout', 0)),
            'hard_timeout': int(omniFlow.get('hardTimeout', 0)),
            'priority': int(omniFlow.get('priority', 0)),
            #'buffer_id': int(omniFlow.get('buffer_id', dp.ofproto.OFP_NO_BUFFER)),
            #'out_port': int(omniFlow.get('out_port', dp.ofproto.OFPP_ANY)),
            #'out_group': int(omniFlow.get('out_group', dp.ofproto.OFPG_ANY)),
            'flags': int(omniFlow.get('flags', 0)),
            'match': {
                'in_port': int(omniFlow.get('ingressPort', 0)),
                #'in_phy_port': int(omniFlow.get('in_phy_port', 0)),
                #'metadata': to_match_metadata,
                'dl_dst': omniFlow.get('dstMac'),
                'dl_src': omniFlow.get('srcMac'),
                #'eth_dst': omniFlow.get('eth_dst'),
                #'eth_src': omniFlow.get('eth_src'),
                'dl_type': int(omniFlow.get('dlType', 0)),
                #'eth_type': int(omniFlow.get('eth_type', 0)),
                'dl_vlan': int(omniFlow.get('vlan', 0)),
                #'vlan_vid': to_match_vid,
                'vlan_pcp': int(omniFlow.get('vlanP', 0)),
                #'ip_dscp': int(omniFlow.get('ip_dscp', 0)),
                #'ip_ecn': int(omniFlow.get('ip_ecn', 0)),
                'nw_proto': int(omniFlow.get('netProtocol', 0)),
                #'ip_proto': int(omniFlow.get('ip_proto', 0)),
                'nw_src': omniFlow.get('srcIP'),
                'nw_dst': omniFlow.get('dstIP'),
                #'ipv4_src': omniFlow.get('ipv4_src'),
                #'ipv4_dst': omniFlow.get('ipv4_dst'),
                ##'tp_src': int(omniFlow.get('srcPort', 0)),
                ##'tp_dst': int(omniFlow.get('dstPort', 0)),
                #'tcp_src': int(omniFlow.get('tcp_src', 0)),
                #'tcp_dst': int(omniFlow.get('tcp_dst', 0)),
                #'udp_src': int(omniFlow.get('udp_src', 0)),
                #'udp_dst': int(omniFlow.get('udp_dst', 0)),
                #'sctp_src': int(omniFlow.get('sctp_src', 0)),
                #'sctp_dst': int(omniFlow.get('sctp_dst', 0)),
                #'icmpv4_type': int(omniFlow.get('icmpv4_type', 0)),
                #'icmpv4_code': int(omniFlow.get('icmpv4_code', 0)),
                #'arp_op': int(omniFlow.get('arp_op', 0)),
                #'arp_spa': to_match_ip,
                #'arp_tpa': to_match_ip,
                #'arp_sha': to_match_eth,
                #'arp_tha': to_match_eth,
                #'ipv6_src': to_match_ip,
                #'ipv6_dst': to_match_ip,
                #'ipv6_flabel': int(omniFlow.get('ipv6_flabel', 0)),
                #'icmpv6_type': int(omniFlow.get('icmpv6_type', 0)),
                #'icmpv6_code': int(omniFlow.get('icmpv6_code', 0)),
                #'ipv6_nd_target': to_match_ip,
                #'ipv6_nd_sll': to_match_eth,
                #'ipv6_nd_tll': to_match_eth,
                #'mpls_label': int(omniFlow.get('mpls_label', 0)),
                #'mpls_tc': int(omniFlow.get('mpls_tc', 0)),
                #'mpls_bos': int(omniFlow.get('mpls_bos', 0)),
                #'pbb_isid': int(omniFlow.get('pbb_isid', 0)),
                #'tunnel_id': int(omniFlow.get('tunnel_id', 0)),
                #'ipv6_exthdr': int(omniFlow.get('ipv6_exthdr', 0))
            },
            'actions': []
        }

        file = open('./log.txt', 'w')
        test = "log for flow mod\n"

        # handle mutiple actions
        acts = omniFlow.get('actions').split(',')
        for a in acts:
            action = self.to_action(dp, a)
            if action is not None:
                ryuFlow['actions'].append(action)

        test += "ryuFlow:%s\n" % ryuFlow        
        file.write(test)
        file.close()
        return ryuFlow

    # repack actions
    def to_action(self, dp, dic):
        action_type = dic.split('=')[0]
        if action_type == 'OUTPUT':
            omniAction = {
                'type': action_type,
                'port': dic.split('=')[1],
                'max_len': 0xffe5
            }
        elif action_type == 'COPY_TTL_OUT':
            omniAction = {
                'type': action_type
            }
        elif action_type == 'COPY_TTL_IN':
            omniAction = {
                'type': action_type
            }
        elif action_type == 'SET_MPLS_TTL':
            omniAction = {
                'type': action_type,
                'mpls_ttl': dic.split('=')[1]
            }
        elif action_type == 'DEC_MPLS_TTL':
            omniAction = {
                'type': action_type
            }
        elif action_type == 'PUSH_VLAN':
            omniAction = {
                'type': action_type,
                'ethertype': dic.split('=')[1]
            }
        elif action_type == 'POP_VLAN':
            omniAction = {
                'type': action_type
            }
        elif action_type == 'PUSH_MPLS':
            omniAction = {
                'type': action_type,
                'ethertype': dic.split('=')[1]
            }
        elif action_type == 'POP_MPLS':
            omniAction = {
                'type': action_type,
                'ethertype': dic.split('=')[1]
            }
        elif action_type == 'SET_QUEUE':
            omniAction = {
                'type': action_type,
                'queue_id': dic.split('=')[1]
            }
        elif action_type == 'GROUP':
            omniAction = {
                'type': action_type,
                'group_id': dic.split('=')[1]
            }
        elif action_type == 'SET_NW_TTL':
            omniAction = {
                'type': action_type,
                'nw_ttl': dic.split('=')[1]
            }
        elif action_type == 'DEC_NW_TTL':
            omniAction = {
                'type': action_type
            }
        elif action_type == 'SET_FIELD':  
            omniAction = {
                'type': action_type
                'field': dic.split('=')[1].split(':')[0]
                'value': dic.split('=')[1].split(':')[1]
            }  
        elif action_type == 'PUSH_PBB':
            omniAction = {
                'type': action_type,
                'ethertype': dic.split('=')[1]
            }  
        elif action_type == 'POP_PBB':
            omniAction = {
                'type': action_type
            }  

        return omniAction

    # repack dpid
    def colonDPID(self, dpid):
        return ':'.join(a+b for a,b in zip(dpid[::2], dpid[1::2]))
