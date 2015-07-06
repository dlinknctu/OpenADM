import httplib
import logging
import json

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class NWInfo:
    '''Network information maintainer for each SDN domain

    This module will handle the raw data which are received from controller
    adapter. Changes are reflected in the internal network information
    structures. Also it will register some RESTful APIs to the core.
    '''

    def __init__(self, core, param):
        '''Initialize network information structure
        '''
        self.controllers = {}
        self.packetins = []
        self.ports = {}
        self.links = {}
        self.devices = {}
        self.hosts = {}
        self.portstats = {}
        self.flowtables = {}

        self.registration(core)
        self.trigger(param['controller_ip'], param['controller_port'],
                param['adapter_port'], param['controller_name'])

    def registration(self, core):
        '''Registration for SSE handlers and RESTful APIs

        Handle the JSON format data which received from controller adapter and
        HTTP requests from Web UI.
        '''
        # Server-Sent Event handlers handle the requests from the southbound
        core.registerSSEHandler('controller', self.controllerHandler)
        core.registerSSEHandler('packet', self.packetHandler)
        core.registerSSEHandler('addlink', self.addlinkHandler)
        core.registerSSEHandler('dellink', self.dellinkHandler)
        core.registerSSEHandler('addport', self.addportHandler)
        core.registerSSEHandler('delport', self.delportHandler)
        core.registerSSEHandler('adddevice', self.adddeviceHandler)
        core.registerSSEHandler('deldevice', self.deldeviceHandler)
        core.registerSSEHandler('addhost', self.addhostHandler)
        core.registerSSEHandler('delhost', self.delhostHandler)
        core.registerSSEHandler('port', self.portHandler)
        core.registerSSEHandler('flow', self.flowHandler)

        # RESTful API for WebUI
        core.registerRestApi('port', self.getPortCounter)
        core.registerRestApi('flow', self.getAllFlows)
        core.registerRestApi('flow/top', self.getTopFlows)

        logger.info('Handlers and RESTful APIs registered')

    def trigger(self, controller_ip, controller_port, adapter_port,
            controller_name):
        '''Trigger controller adapter to send events to us

        The controller adapter requires a controller name. Otherwise it will
        not send any events.
        '''
        conn = httplib.HTTPConnection(controller_ip, int(adapter_port))
        try:
            conn.request("POST", "/wm/omniui/controller/name", controller_name)
            res = conn.getresponse()
        except Exception as e:
            logger.error('Controller identification (%s:%s -> %s): %s' %
                    (controller_ip, controller_port, controller_name, str(e)))
        else:
            logger.info('Controller identification (%s:%s -> %s): %s' %
                    (controller_ip, controller_port, controller_name, res.read()))

    def controllerHandler(self, raw):
        '''Controller information event

        Datastore: controller <type 'dict'>
        '''
        if raw == 'debut':
            return json.dumps(self.controllers)
        key = raw['name']
        self.controllers[key] = raw
        logger.debug('Controller information: %s' % self.controllers[key])

        result = json.dumps(self.controllers[key])
        return result

    def packetHandler(self, raw):
        '''Packet-In event

        Datastore: packetins <type 'list'>
        '''
        if raw == 'debut':
            return None
        self.packetins.append(raw)
        logger.debug('Total packet-in events: %d' % len(self.packetins))

        result = json.dumps(raw)
        return result

    def addlinkHandler(self, raw):
        '''Add link event

        Datastore: links <type 'dict'>
        Key: (source switch DPID,
              destination switch DPID,
              source switch port,
              destination switch port)
        '''
        if raw == 'debut':
            return json.dumps(self.links.values())
        key = (raw['src_dpid'], raw['dst_dpid'], raw['src_port'], raw['dst_port'])
        src_uuid = abs(int(str(hash(raw['src_dpid']))[8:]))
        dst_uuid = abs(int(str(hash(raw['dst_dpid']))[8:]))
        if key in self.links.keys():
            return None
        self.links[key] = [{'uuid': src_uuid,
                            'src_dpid': raw['src_dpid'],
                            'src_port': raw['src_port']},
                           {'uuid': dst_uuid,
                            'dst_dpid': raw['dst_dpid'],
                            'dst_port': raw['dst_port']}]
        logger.debug('Total links after addition: %d' % len(self.links))

        result = json.dumps(self.links[key])
        return result

    def dellinkHandler(self, raw):
        '''Delete link event

        Datastore: links <type 'dict'>
        Key: (source switch DPID,
              destination switch DPID,
              source switch port,
              destination switch port)
        '''
        if raw == 'debut':
            return None
        try:
            key = (raw['src_dpid'], raw['dst_dpid'], raw['src_port'], raw['dst_port'])
            del self.links[key]
        except KeyError as e:
            logger.warn('Key of link down event not found: %s' % str(e))
            return None
        logger.debug('Total links after deletion: %d' % len(self.links))

        src_uuid = abs(int(str(hash(raw['src_dpid']))[8:]))
        dst_uuid = abs(int(str(hash(raw['dst_dpid']))[8:]))
        result = json.dumps([{'uuid': src_uuid,
                              'src_dpid': raw['src_dpid'],
                              'src_port': raw['src_port']},
                             {'uuid': dst_uuid,
                              'dst_dpid': raw['dst_dpid'],
                              'dst_port': raw['dst_port']}])
        return result

    def addportHandler(self, raw):
        '''Add port event

        Datastore: ports <type 'dict'>
        Key: (switch DPID, switch port)
        '''
        if raw == 'debut':
            return json.dumps(self.ports.values())
        key = (raw['dpid'], raw['port'])
        if key in self.ports.keys():
            return None
        self.ports[key] = {'dpid': raw['dpid'], 'port': raw['port']}
        logger.debug('Total ports after addition: %d' % len(self.ports))

        result = json.dumps(self.ports[key])
        return result

    def delportHandler(self, raw):
        '''Delete port event

        Datastore: ports <type 'dict'>
        Key: (switch DPID, switch port)
        '''
        if raw == 'debut':
            return None
        try:
            key = (raw['dpid'], raw['port'])
            del self.ports[key]
        except KeyError as e:
            logger.warn('Key of port down event not found: %s' % str(e))
            return None
        logger.debug('Total ports after deletion: %d' % len(self.ports))

        result = json.dumps({'dpid': raw['dpid'], 'port': raw['port']})
        return result

    def adddeviceHandler(self, raw):
        '''Add device event

        Datastore: devices <type 'dict'>
        Key: switch DPID
        '''
        if raw == 'debut':
            return json.dumps(self.devices.values())
        key = raw['dpid']
        if key in self.devices.keys():
            return None
        uuid = abs(int(str(hash(key))[8:]))
        self.devices[key] = {'uuid': uuid, 'dpid': raw['dpid'], 'type': 'switch'}
        logger.debug('Total devices after addition: %d' % len(self.devices))

        result = json.dumps(self.devices[key])
        return result

    def deldeviceHandler(self, raw):
        '''Delete device event

        Datastore: devices <type 'dict'>
        Key: switch DPID
        '''
        if raw == 'debut':
            return None
        try:
            key = raw['dpid']
            del self.devices[key]
        except KeyError as e:
            logger.warn('Key of device down event not found: %s' % str(e))
            return None
        logger.debug('Total devices after deletion: %d' % len(self.devices))

        uuid = abs(int(str(hash(key))[8:]))
        result = json.dumps({'uuid': uuid, 'dpid': raw['dpid'], 'type': 'switch'})
        return result

    def addhostHandler(self, raw):
        '''Add host event

        Datastore: hosts <type 'dict'>
        Key: host MAC address
        '''
        if raw == 'debut':
            return json.dumps(self.hosts.values())
        key = raw['mac']
        uuid = abs(int(str(hash(key))[8:]))
        if key in self.hosts.keys():
            return None
        self.hosts[key] = {'uuid': uuid,
                           'mac': raw['mac'],
                           'ips': raw.get('ips', []),
                           'aps': raw['aps'],
                           'type': 'host'}
        # Build link between host and switches
        tmp = []
        for ap in raw['aps']:
            key2 = (raw['mac'], ap['dpid'], ap['port'])
            mac_uuid = abs(int(str(hash(raw['mac']))[8:]))
            sw_uuid = abs(int(str(hash(ap['dpid']))[8:]))
            if key2 in self.links.keys():
                pass
            self.links[key2] = [{'uuid': mac_uuid,
                                 'mac': raw['mac']},
                                {'uuid': sw_uuid,
                                 'dpid': ap['dpid'],
                                 'port': ap['port']}]
            tmp.append(self.links[key2])

        logger.debug('Total hosts after addition: %d' % len(self.hosts))

        result = json.dumps(tmp)
        return result

    def delhostHandler(self, raw):
        '''Delete host handler

        Datastore: hosts <type 'dict'>
        Key: host MAC address
        '''
        if raw == 'debut':
            return None
        try:
            key = raw['mac']
            del self.hosts[key]
        except KeyError as e:
            logger.warn('Key of host down event not found: %s' % str(e))
            return None
        logger.debug('Total hosts after deletion: %d' % len(self.hosts))

        # Build link between host and switches
        tmp = []
        for ap in raw['aps']:
            key2 = (raw['mac'], ap['dpid'], ap['port'])
            mac_uuid = abs(int(str(hash(raw['mac']))[8:]))
            sw_uuid = abs(int(str(hash(ap['dpid']))[8:]))
            if key2 in self.links.keys():
                pass
            self.links[key2] = [{'uuid': mac_uuid,
                                 'mac': raw['mac']},
                                {'uuid': sw_uuid,
                                 'dpid': ap['dpid'],
                                 'port': ap['port']}]
            tmp.append(self.links[key2])

        result = json.dumps(tmp)
        return result

    def portHandler(self, raw):
        '''Update switch port statistics event (polling)

        Datastore: portstats <type 'dict'>
        Key: (switch DPID, switch port)

        This kind of event will not sent to WebUI actively.
        '''
        if raw == 'debut':
            return None
        key = (raw['dpid'], raw['port'])
        self.portstats[key] = {'dpid': raw['dpid'],
                               'port': raw['port'],
                               'rxbyte': raw['rxbyte'],
                               'rxpacket': raw['rxpacket'],
                               'txbyte': raw['txbyte'],
                               'txpacket': raw['txpacket']}
        logger.debug('port statistics number: %d' % len(self.portstats))

        return None

    def flowHandler(self, raw):
        '''Update flow table event (polling)

        Datastore: flowtables <type 'dict'>
        Key: switch DPID

        This kind of event will not sent to WebUI actively.
        '''
        if raw == 'debut':
            return None
        key = raw['dpid']
        sorted(raw['flows'], key=lambda k: k['counterByte'], reverse=True)
        self.flowtables[key] = {'dpid': raw['dpid'],
                                'flows': raw['flows']}
        logger.debug('flow entries: %d' % len(self.flowtables[key]['flows']))

        return None

    def getPortCounter(self, req):
        '''Return port statistics of a specific switch port

        Usage:
            /port?dpid=<sw_dpid>&port=<sw_port>
            /port?dpid=<sw_dpid>
            /port?port=<sw_port>
            /port
        '''
        dpid = req.args.get('dpid')
        port = req.args.get('port')
        if dpid != None and port != None:
            key = (dpid, port)
            try:
                result = json.dumps(self.portstats[key])
            except KeyError as e:
                logger.warn('Key of portstats not found: %s' % str(e))
                result = json.dumps([])
        elif dpid != None:
            tmp = [self.portstats[(d, p)]
                   for (d, p) in self.portstats.keys()
                       if d == dpid]
            result = json.dumps(tmp)
        elif port != None:
            tmp = [self.portstats[(d, p)]
                   for (d, p) in self.portstats.keys()
                       if p == port]
            result = json.dumps(tmp)
        else:
            tmp = [self.portstats[(d, p)]
                   for (d, p) in self.portstats.keys()]
            result = json.dumps(tmp)

        return result

    def getAllFlows(self, req):
        '''Return all flow entries of switches

        Usage:
            /flow?dpid=<sw_dpid>
            /flow
        '''
        dpid = req.args.get('dpid')
        if dpid is not None:
            try:
                result = json.dumps({'dpid': dpid,
                                     'flows': self.flowtables[dpid]['flows']})
            except KeyError as e:
                logger.warn('Key of flows not found: %s' % str(e))
                result = json.dumps([])
        else:
            tmp = [{'dpid': id, 'flows': self.flowtables[id]['flows']}
                   for id in self.flowtables.keys()]
            result = json.dumps(tmp)

        return result

    def getTopFlows(self, req):
        '''Return top flow entries of switches (default 10)

        Usage:
            /flow/top?dpid=<sw_dpid>
            /flow/top
        '''
        dpid = req.args.get('dpid')
        if dpid is not None:
            try:
                result = json.dumps({'dpid': dpid,
                                     'flows': self.flowtables[dpid]['flows'][0:10]})
            except KeyError as e:
                logger.warn('Key of flows not found: %s' % str(e))
                result = json.dumps([])
        else:
            tmp = [{'dpid': id, 'flows': self.flowtables[id]['flows'][0:10]}
                   for id in self.flowtables.keys()]
            result = json.dumps(tmp)

        return result

