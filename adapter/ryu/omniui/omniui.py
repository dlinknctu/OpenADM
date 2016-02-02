import json
import sys
import ast
import logging as LOG
from webob import Response
from ryu.app.wsgi import ControllerBase, WSGIApplication, route
from ryu.base import app_manager
from ryu.controller import ofp_event
from ryu.controller import dpset
from ryu.controller.handler import MAIN_DISPATCHER, CONFIG_DISPATCHER, DEAD_DISPATCHER
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
import requests
import subprocess
from operator import attrgetter
from ryu.ofproto.ether import ETH_TYPE_LLDP, ETH_TYPE_IPV6
from ryu.lib import hub
from ryu.lib.packet import *
from ryu.topology import event, switches

global controllerName
controllerName = 'DEFAULT'

class OmniUI(app_manager.RyuApp):
    OFP_VERSIONS = [ofproto_v1_0.OFP_VERSION, ofproto_v1_2.OFP_VERSION, ofproto_v1_3.OFP_VERSION]
    _EVENTS = [event.EventPortAdd]
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
        self.mac_to_port = {}
        self.port_to_feature = {}
        self.datapaths = {}
        self.monitor_thread = hub.spawn(self.monitor)
        self.dpset = self.data['dpset']
        mapper = wsgi.mapper
        wsgi.registory['RestController'] = self.data

        mapper.connect('omniui', '/wm/omniui/add/json',
                       controller=RestController, action='mod_flow_entry',
                       conditions=dict(method=['POST']))
        mapper.connect('omniui', '/wm/omniui/controller/name',
                       controller=RestController, action='get_controller_name',
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

    @set_ev_cls(ofp_event.EventOFPSwitchFeatures, CONFIG_DISPATCHER)
    def switch_features_handler(self, ev):
        datapath = ev.msg.datapath
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser

        match = parser.OFPMatch()
        actions = [parser.OFPActionOutput(ofproto.OFPP_CONTROLLER,
                                          ofproto.OFPCML_NO_BUFFER)]
        self.add_flow(datapath, 0, match, actions)

    def add_flow(self, datapath, priority, match, actions):
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser

        inst = [parser.OFPInstructionActions(ofproto.OFPIT_APPLY_ACTIONS,
                                             actions)]

        mod = parser.OFPFlowMod(datapath=datapath, priority=priority,
                                match=match, instructions=inst)
        datapath.send_msg(mod)

    #
    # try post json to core
    #
    def post_json_to_core(self, url, data):
        try:
            resp = requests.post(url, data = data, headers = {'Content-Type': 'application/json'})
            print resp
        except Exception, e:
            print(str(e))

    #
    # handle add switch event
    #
    @set_ev_cls(event.EventSwitchEnter)
    def add_device_handler(self, ev):
        switch = ev.switch
        print '*****add device*****'

        # format dpid
        temp = "%016x" %switch.dp.id
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')

        addDevice = {
            'dpid': ''.join(temp),
            'controller': controllerName
        }
        self.port_to_feature[addDevice['dpid']] = {}

        print json.dumps(addDevice)
        self.post_json_to_core("http://localhost:5567/publish/adddevice", json.dumps(addDevice))

        # send add port event
        for port in switch.ports:
            n_ev = event.EventPortAdd(port)
            self.send_event_to_observers(n_ev)

    #
    # handle delete switch event
    #
    @set_ev_cls(event.EventSwitchLeave)
    def del_device_handler(self, ev):
        switch = ev.switch
        print '*****del device*****'

        # format dpid
        temp = "%016x" %switch.dp.id
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')

        delDevice = {
            'dpid': ''.join(temp),
            'controller': controllerName
        }
        del self.port_to_feature[delDevice['dpid']]

        print json.dumps(delDevice)
        self.post_json_to_core("http://localhost:5567/publish/deldevice", json.dumps(delDevice))

    #
    # handle modify port event
    #
    @set_ev_cls(event.EventPortModify)
    def mod_port_handler(self, ev):
        port = ev.port
        print '*****mod port*****'

        if port.is_down():
            print '***down***'

            # format dpid
            temp = "%016x" %port.dpid
            temp = map(str, temp)
            for i in range(2, 23, 3):
                temp.insert(i, ':')

            modPort = {
                'dpid': ''.join(temp),
                'port': str(port.port_no),
                'controller': controllerName
            }
            del self.port_to_feature[modPort['dpid']][modPort['port']]

            print json.dumps(modPort)
            self.post_json_to_core("http://localhost:5567/publish/delport", json.dumps(modPort))
        else:
            print '***live***'

            # format dpid
            temp = "%016x" %port.dpid
            temp = map(str, temp)
            for i in range(2, 23, 3):
                temp.insert(i, ':')

            modPort = {
                'dpid': ''.join(temp),
                'port': str(port.port_no),
                'controller': controllerName
            }
            self.port_to_feature[modPort['dpid']][modPort['port']] = str(port.currentFeatures)

            print json.dumps(modPort)
            self.post_json_to_core("http://localhost:5567/publish/addport", json.dumps(modPort))

    #
    # handle add port event
    #
    @set_ev_cls(event.EventPortAdd)
    def add_port_handler(self, ev):
        port = ev.port
        print '*****add port*****'

        # format dpid
        temp = "%016x" %port.dpid
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')

        addPort = {
            'dpid': ''.join(temp),
            'port': str(port.port_no),
            'controller': controllerName
        }
        self.port_to_feature[addPort['dpid']][addPort['port']] = str(port.currentFeatures)

        print json.dumps(addPort)
        self.post_json_to_core("http://localhost:5567/publish/addport", json.dumps(addPort))

    #
    # handle delete port event
    #
    @set_ev_cls(event.EventPortDelete)
    def del_port_handler(self, ev):
        port = ev.port
        print '*****del port*****'

        # format dpid
        temp = "%016x" %port.dpid
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')

        delPort = {
            'dpid': ''.join(temp),
            'port': str(port.port_no),
            'controller': controllerName
        }
        del self.port_to_feature[delPort['dpid']][delPort['port']]

        print json.dumps(delPort)
        self.post_json_to_core("http://localhost:5567/publish/delport", json.dumps(delPort))

    #
    # handle add link event
    #
    @set_ev_cls(event.EventLinkAdd)
    def add_link_handler(self, ev):
        link = ev.link
        print '*****add link*****'

        # format src dpid
        temp = "%016x" %link.src.dpid
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')
        nodesrc = {
            'dpid': ''.join(temp),
            'port': str(link.src.port_no)
        }

        # format dst dpid
        temp = "%016x" %link.dst.dpid
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')
        nodedst = {
            'dpid': ''.join(temp),
            'port': str(link.dst.port_no)
        }

        addLink = {
            'link': [nodesrc, nodedst],
            'controller': controllerName
        }

        print json.dumps(addLink)
        self.post_json_to_core("http://localhost:5567/publish/addlink", json.dumps(addLink))

    #
    # handle delete link event
    #
    @set_ev_cls(event.EventLinkDelete)
    def del_link_handler(self, ev):
        link = ev.link
        print '*****del link*****'

        # format src dpid
        temp = "%016x" %link.src.dpid
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')
        nodesrc = {
            'dpid': ''.join(temp),
            'port': str(link.src.port_no)
        }

        # format dst dpid
        temp = "%016x" %link.dst.dpid
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')
        nodedst = {
            'dpid': ''.join(temp),
            'port': str(link.dst.port_no)
        }

        delLink = {
            'link': [nodesrc, nodedst],
            'controller': controllerName
        }

        print json.dumps(delLink)
        self.post_json_to_core("http://localhost:5567/publish/dellink", json.dumps(delLink))

    #
    # handle add host event
    #
    @set_ev_cls(event.EventHostAdd)
    def add_host_handler(self, ev):
        host = ev.host
        print '*****add host*****'

        # format dpid
        temp = "%016x" %host.port.dpid
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')
        nodeloc = {
            'dpid': ''.join(temp),
            'port': str(host.port.port_no)
        }

        addHost = {
            'mac': host.mac,
            'type': 'wired',
            'location': nodeloc,
            'vlan': str(host.vlan[len(host.vlan)-1]) if host.vlan else "0",
            'ip': str(host.ipv4[len(host.ipv4)-1]) if host.ipv4 else "0.0.0.0",
            'controller': controllerName
        }

        print json.dumps(addHost)
        self.post_json_to_core("http://localhost:5567/publish/addhost", json.dumps(addHost))

    #
    # handle delete host event
    #
    @set_ev_cls(event.EventHostDelete)
    def del_host_handler(self, ev):
        host = ev.host
        print '*****del host*****'

        delHost = {
            'mac': host.mac,
            'controller': controllerName
        }

        print json.dumps(delHost)
        self.post_json_to_core("http://localhost:5567/publish/delhost", json.dumps(delHost))

    #
    # handle packet in event
    #
    @set_ev_cls(ofp_event.EventOFPPacketIn, MAIN_DISPATCHER)
    def packet_in_handler(self, ev):
        msg = ev.msg
        datapath = msg.datapath
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser

        dpid = datapath.id

        if ofproto.OFP_VERSION == ofproto_v1_0.OFP_VERSION:
            in_port = msg.in_port
        else:
            in_port = msg.match['in_port']

        pkt = packet.Packet(msg.data)
        eth = pkt.get_protocols(ethernet.ethernet)[0]

        # ignore lldp packet & ipv6
        if (eth.ethertype == ETH_TYPE_LLDP) | (eth.ethertype == ETH_TYPE_IPV6):
            return

        src = eth.src
        dst = eth.dst

        self.mac_to_port.setdefault(dpid, {})
        
        # learn a mac address to avoid FLOOD next time.
        self.mac_to_port[dpid][src] = in_port

        if dst in self.mac_to_port[dpid]:
            out_port = self.mac_to_port[dpid][dst]
        else:
            out_port = ofproto.OFPP_FLOOD

        actions = [parser.OFPActionOutput(out_port)]

        # install a flow to avoid packet_in next time
        if out_port != ofproto.OFPP_FLOOD:
            match = parser.OFPMatch(in_port=in_port, eth_dst=dst, eth_src=src)
            self.add_flow(datapath, 1, match, actions)

        data = None
        if msg.buffer_id == ofproto.OFP_NO_BUFFER:
            data = msg.data

        out = parser.OFPPacketOut(datapath=datapath, buffer_id=msg.buffer_id,
                                  in_port=in_port, actions=actions, data=data)
        datapath.send_msg(out)

        print '*****packet in*****'

        packetIn = {}

        # format dpid
        temp = "%016x" %dpid
        temp = map(str, temp)
        for i in range(2, 23, 3):
            temp.insert(i, ':')
        packetIn["dpid"] = ''.join(temp)

        packetIn["in_port"] = str(in_port)

        pkt_ethernet = pkt.get_protocol(ethernet.ethernet)
        if not pkt_ethernet:
            return
        else:
            packetIn["mac_src"] = pkt_ethernet.src
            packetIn["mac_dst"] = pkt_ethernet.dst
            packetIn["ether_type"] = 'x0'.join(hex(pkt_ethernet.ethertype).split('x')) if len(hex(pkt_ethernet.ethertype)) < 6 else hex(pkt_ethernet.ethertype)

        for p in pkt.protocols:
            if hasattr(p, 'src'):
                packetIn["ip_src"] = p.src
                packetIn["ip_dst"] = p.dst

            if hasattr(p, 'src_ip'):
                packetIn["ip_src"] = p.src_ip
                packetIn["ip_dst"] = p.dst_ip

            if hasattr(p, 'proto'):
                packetIn["protocol"] = 'x0'.join(hex(p.proto).split('x')) if ((len(hex(p.proto)) < 4) | (len(hex(p.proto)) == 5)) else hex(p.proto)

            if hasattr(p, 'src_port'):
                packetIn["port_src"] = str(p.src_port)
                packetIn["port_dst"] = str(p.dst_port)

        packetIn["protocol"] = '0' if 'protocol' not in packetIn else packetIn["protocol"]
        packetIn["ip_src"] = '0.0.0.0' if 'ip_src' not in packetIn else packetIn["ip_src"]
        packetIn["ip_dst"] = '0.0.0.0' if 'ip_dst' not in packetIn else packetIn["ip_dst"]
        packetIn["port_src"] = '0' if 'port_src' not in packetIn else packetIn["port_src"]
        packetIn["port_dst"] = '0' if 'port_dst' not in packetIn else packetIn["port_dst"]
        packetIn["controller"] = controllerName

        print json.dumps(packetIn)
        self.post_json_to_core("http://localhost:5567/publish/packet", json.dumps(packetIn))

    #
    # for datapath
    #
    @set_ev_cls(ofp_event.EventOFPStateChange, [MAIN_DISPATCHER, DEAD_DISPATCHER])
    def state_change_handler(self, ev):
        datapath = ev.datapath
        if ev.state == MAIN_DISPATCHER:
            if not datapath.id in self.datapaths:
                self.logger.debug('register datapath: %016x', datapath.id)
                self.datapaths[datapath.id] = datapath
        elif ev.state == DEAD_DISPATCHER:
            if datapath.id in self.datapaths:
                self.logger.debug('unregister datapath: %016x', datapath.id)
                del self.datapaths[datapath.id]

    #
    # for polling
    #
    def monitor(self):
        while True:
            for dp in self.datapaths.values():
                tempflow = self.flow_stats_reply_handler_API(dp.id) # from OpenADM
                tempport = self.port_stats_reply_handler_API(dp.id) # from OpenADM
            self.controller_stats_reply_handler()

            hub.sleep(5)

    #
    # polling controller
    #
    def controller_stats_reply_handler(self):
        print '----------------------controller----------------------'

        os = subprocess.check_output("cat /etc/issue".split())
        mem = subprocess.check_output("free -h", shell=True)
        cpu = subprocess.check_output("cat /proc/loadavg".split())
        controllerstatsReply = {
            'controller': controllerName,
            'type': 'ryu',
            'os': ' '.join(os.split()),
            'mem_total': mem.split()[7],
            'mem_used': mem.split()[8],
            'mem_free': mem.split()[9],
            'cpu': cpu.split()[0]
        }

        print json.dumps(controllerstatsReply)
        self.post_json_to_core("http://localhost:5567/publish/controller", json.dumps(controllerstatsReply))

    #
    # polling flows
    #
    def flow_stats_reply_handler_API(self, dpid):
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

        print '----------------------flowAPI----------------------'

        flowstatsReplyAPI = {}
        flowstatsReplyAPI["controller"] = controllerName

        for key in flows:
            temp = "%016x" %int(key)
            temp = map(str, temp)
            for i in range(2, 23, 3):
                temp.insert(i, ':')
            flowstatsReplyAPI["dpid"] = ''.join(temp)

            flowstatsReplyAPI["flows"] = []
            i = 0
            for inflow in flows[key]:
                if inflow["priority"] == 1:
                    flowstatsReplyAPI["flows"].append({})
                    flowstatsReplyAPI["flows"][i]["ingressPort"] = str(inflow['match']['in_port']) if 'in_port' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["dstMac"] = inflow['match']['dl_dst'] if 'dl_dst' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["srcMac"] = inflow['match']['dl_src'] if 'dl_src' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["dstIP"] = inflow['match']['nw_dst'] if 'nw_dst' in inflow['match'] else "0.0.0.0"
                    flowstatsReplyAPI["flows"][i]["dstIPMask"] = "0" # not support in ryu
                    flowstatsReplyAPI["flows"][i]["srcIP"] = inflow['match']['nw_src'] if 'nw_src' in inflow['match'] else "0.0.0.0"
                    flowstatsReplyAPI["flows"][i]["srcIPMask"] = "0" # not support in ryu
                    flowstatsReplyAPI["flows"][i]["netProtocol"] = hex(inflow['match']['nw_proto']) if 'nw_proto' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["dstPort"] = str(inflow['match']['tp_dst']) if 'tp_dst' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["srcPort"] = str(inflow['match']['tp_src']) if 'tp_src' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["vlan"] = str(inflow['match']['dl_vlan']) if 'dl_vlan' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["vlanP"] = str(inflow['match']['dl_vlan_pcp']) if 'dl_vlan_pcp' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["wildcards"] = str(inflow['match']['wildcards']) if 'wildcards' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["tosBits"] = str(inflow['match']['nw_tos']) if 'nw_tos' in inflow['match'] else "0"
                    flowstatsReplyAPI["flows"][i]["counterByte"] = str(inflow['byte_count'])
                    flowstatsReplyAPI["flows"][i]["counterPacket"] = str(inflow['packet_count'])
                    flowstatsReplyAPI["flows"][i]["idleTimeout"] = str(inflow['idle_timeout'])
                    flowstatsReplyAPI["flows"][i]["hardTimeout"] = str(inflow['hard_timeout'])
                    flowstatsReplyAPI["flows"][i]["priority"] = str(inflow['priority'])
                    flowstatsReplyAPI["flows"][i]["duration"] = str(inflow['duration_sec'])
                    flowstatsReplyAPI["flows"][i]["dlType"] = hex(inflow['match']['dl_type']) if 'dl_type' in inflow['match'] else "0"

                    flowstatsReplyAPI["flows"][i]["actions"] = []
                    for action in inflow['actions']:
                        if len(action.split(':')) == 1:
                            act = {
                                "value": "0",
                                "type": action
                            }
                        else:
                            act = {
                                "value": action.split(':')[1],
                                "type": action.split(':')[0]
                            }
                        flowstatsReplyAPI["flows"][i]["actions"].append(act)

                    i += 1

        print json.dumps(flowstatsReplyAPI)
        self.post_json_to_core("http://localhost:5567/publish/flow", json.dumps(flowstatsReplyAPI))
        return flows

    #
    # polling ports
    #
    def port_stats_reply_handler_API(self, dpid):
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

        print '----------------------portAPI----------------------'

        for key in ports:
            for port in ports[key]:
                portstatsReplyAPI = {
                    'controller': controllerName,
                    'port': str(port['port_no']),
                    'rxbyte': str(port['rx_bytes']),
                    'rxpacket': str(port['rx_packets']),
                    'txbyte': str(port['tx_bytes']),
                    'txpacket': str(port['tx_packets'])
                }

                temp = "%016x" %int(key)
                temp = map(str, temp)
                for i in range(2, 23, 3):
                    temp.insert(i, ':')
                portstatsReplyAPI["dpid"] = ''.join(temp)
                portstatsReplyAPI["capacity"] = self.port_to_feature[portstatsReplyAPI['dpid']][portstatsReplyAPI['port']] if portstatsReplyAPI['port'] in self.port_to_feature[portstatsReplyAPI['dpid']] else '0'

                print json.dumps(portstatsReplyAPI)
                self.post_json_to_core("http://localhost:5567/publish/port", json.dumps(portstatsReplyAPI))
        return ports


class RestController(ControllerBase):
    def __init__(self, req, link, data, **config):
        super(RestController, self).__init__(req, link, data, **config)
        self.dpset = data['dpset']

    def get_controller_name(self, req, **kwargs):
        try:
            global controllerName
            controllerName = req.body
            print '*****NAME: ' + controllerName + '*****'
        except SyntaxError:
            return Response(status=400)

        return Response(status=200)

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

        ryuFlow={}
        if dp.ofproto.OFP_VERSION == ofproto_v1_0.OFP_VERSION:
            ryuFlow = self.ryuFlow_v1_0(dp, omniFlow)
            ofctl_v1_0.mod_flow_entry(dp, ryuFlow, cmd)
        elif dp.ofproto.OFP_VERSION == ofproto_v1_3.OFP_VERSION:
            ryuFlow = self.ryuFlow_v1_3(dp, omniFlow)
            ofctl_v1_3.mod_flow_entry(dp, ryuFlow, cmd)
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
                action = self.to_action_v1_0(dp, act)
                ryuFlow['actions'].append(action)

        return ryuFlow

    # repack 1.0 actions
    def to_action_v1_0(self, dp, actions):
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

    # restore to Ryu Openflow v1.3 flow format
    def ryuFlow_v1_3(self, dp, omniFlow):
        ryuFlow = {
            'cookie': int(omniFlow.get('cookie', 0)),
            'cookie_mask': int(omniFlow.get('cookie_mask', 0)),
            'table_id ': int(omniFlow.get('table_id', 0)),
            'idle_timeout': int(omniFlow.get('idleTimeout', 0)),
            'hard_timeout': int(omniFlow.get('hardTimeout', 0)),
            'priority': int(omniFlow.get('priority', 0)),
            'buffer_id': int(omniFlow.get('buffer_id', dp.ofproto.OFP_NO_BUFFER)),
            'out_port': int(omniFlow.get('out_port', dp.ofproto.OFPP_ANY)),
            'out_group': int(omniFlow.get('out_group', dp.ofproto.OFPG_ANY)),
            'flags': int(omniFlow.get('flags', 0)),
            'match': {},
            'actions': []
        }

        # convert match field from omniui to ryu
        for key in omniFlow:
            match = self.to_match_v1_3(dp, key, omniFlow)
            if match is not None:
                ryuFlow['match'].update(match) 

        # handle mutiple actions
        acts = omniFlow.get('actions').split(',')
        for a in acts:
            action = self.to_action_v1_3(dp, a)
            if action is not None:
                ryuFlow['actions'].append(action)

        return ryuFlow

    # repack 1.3 match
    def to_match_v1_3(self, dp, omni_key, omniFlow):
        # convert key from omniui to ryu, and change its type
        convert = {
            'ingressPort': ['in_port', int],
            'in_phy_port': ['in_phy_port', int],
            'metadata': ['metadata', str],
            'dstMac': ['dl_dst', str],
            'srcMac': ['dl_src', str],
            'eth_dst': ['eth_dst', str],
            'eth_src': ['eth_src', str],
            'dlType': ['dl_type', int],
            'eth_type': ['eth_type', int],
            'vlan': ['dl_vlan', str],
            'vlan_vid': ['vlan_vid', str],
            'vlanP': ['vlan_pcp', int],
            'ip_dscp': ['ip_dscp', int],
            'ip_ecn': ['ip_ecn', int],
            'netProtocol': ['nw_proto', int],
            'ip_proto': ['ip_proto', int],
            'srcIP': ['nw_src', str],
            'dstIP': ['nw_dst', str],
            'ipv4_src': ['ipv4_src', str],
            'ipv4_dst': ['ipv4_dst', str],
            'srcPort': ['tp_src', int],
            'dstPort': ['tp_dst', int],
            'tcp_src': ['tcp_src', int],
            'tcp_dst': ['tcp_dst', int],
            'udp_src': ['udp_src', int],
            'udp_dst': ['udp_dst', int],
            'sctp_src': ['sctp_src', int],
            'sctp_dst': ['sctp_dst', int],
            'icmpv4_type': ['icmpv4_type', int],
            'icmpv4_code': ['icmpv4_code', int],
            'arp_op': ['arp_op', int],
            'arp_spa': ['arp_spa', str],
            'arp_tpa': ['arp_tpa', str],
            'arp_sha': ['arp_sha', str],
            'arp_tha': ['arp_tha', str],
            'ipv6_src': ['ipv6_src', str],
            'ipv6_dst': ['ipv6_dst', str],
            'ipv6_flabel': ['ipv6_flabel', int],
            'icmpv6_type': ['icmpv6_type', int],
            'icmpv6_code': ['icmpv6_code', int],
            'ipv6_nd_target': ['ipv6_nd_target', str],
            'ipv6_nd_sll': ['ipv6_nd_sll', str],
            'ipv6_nd_tll': ['ipv6_nd_tll', str],
            'mpls_label': ['mpls_label', int],
            'mpls_tc': ['mpls_tc', int],
            'mpls_bos': ['mpls_bos', int],
            'pbb_isid': ['pbb_isid', int],
            'tunnel_id': ['tunnel_id', int],
            'ipv6_exthdr': ['ipv6_exthdr', int]
        }

        for key, value in convert.items():
            if omni_key == key:
                ryuMatch = {
                    value[0]: value[1](omniFlow.get(omni_key))
                }
                return ryuMatch

        return None
        
    # repack 1.3 actions
    def to_action_v1_3(self, dp, dic):
        action_type = dic.split('=')[0]
        if action_type == 'OUTPUT':
            ryuAction = {
                'type': action_type,
                'port': dic.split('=')[1]
            }
        elif action_type == 'COPY_TTL_OUT':
            ryuAction = {
                'type': action_type
            }
        elif action_type == 'COPY_TTL_IN':
            ryuAction = {
                'type': action_type
            }
        elif action_type == 'SET_MPLS_TTL':
            ryuAction = {
                'type': action_type,
                'mpls_ttl': dic.split('=')[1]
            }
        elif action_type == 'DEC_MPLS_TTL':
            ryuAction = {
                'type': action_type
            }
        elif action_type == 'PUSH_VLAN':
            ryuAction = {
                'type': action_type,
                'ethertype': dic.split('=')[1]
            }
        elif action_type == 'POP_VLAN':
            ryuAction = {
                'type': action_type
            }
        elif action_type == 'PUSH_MPLS':
            ryuAction = {
                'type': action_type,
                'ethertype': dic.split('=')[1]
            }
        elif action_type == 'POP_MPLS':
            ryuAction = {
                'type': action_type,
                'ethertype': dic.split('=')[1]
            }
        elif action_type == 'SET_QUEUE':
            ryuAction = {
                'type': action_type,
                'queue_id': dic.split('=')[1]
            }
        elif action_type == 'GROUP':
            ryuAction = {
                'type': action_type,
                'group_id': dic.split('=')[1]
            }
        elif action_type == 'SET_NW_TTL':
            ryuAction = {
                'type': action_type,
                'nw_ttl': dic.split('=')[1]
            }
        elif action_type == 'DEC_NW_TTL':
            ryuAction = {
                'type': action_type
            }
        elif action_type == 'SET_FIELD':  
            ryuAction = {
                'type': action_type,
                'field': dic.split('=')[1].split(':')[0],
                'value': dic.split('=')[1].split(':')[1]
            }  
        elif action_type == 'PUSH_PBB':
            ryuAction = {
                'type': action_type,
                'ethertype': dic.split('=')[1]
            }  
        elif action_type == 'POP_PBB':
            ryuAction = {
                'type': action_type
            } 
        else:
            ryuAction = None 

        return ryuAction

    # restore Ryu-format dpid
    def nospaceDPID(self, dpid):
        return "".join(dpid)
