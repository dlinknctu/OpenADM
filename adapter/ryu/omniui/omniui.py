import json
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

    # repack dpid
    def colonDPID(self, dpid):
        return ':'.join(a+b for a,b in zip(dpid[::2], dpid[1::2]))
