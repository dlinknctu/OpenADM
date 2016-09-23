import httplib
import logging
import json

from copy import deepcopy

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

class NWInfo:
    """Network information maintainer for each SDN domain

    This module will handle the raw data which are received from controller
    adapter. Changes are reflected in the internal network information
    structures. Also it will register some RESTful APIs to the core.
    """

    def __init__(self, core, param):
        """Initialize network information structure
        """
        self.controllers = {}
        self.packetins = []
        self.ports = {}
        self.links = {}
        self.devices = {}
        self.hosts = {}
        self.portstats = {}
        self.flowtables = {}
        self.tags = {}

        self.__registration(core)
        self.__trigger(param['controller_ip'], param['controller_port'],
                param['adapter_port'], param['controller_name'])

    def __registration(self, core):
        """Registration for Adapter handlers and websocket APIs

        Handle the JSON format data which received from controller adapter and
        HTTP requests from Web UI.
        """
        # Adapter handlers handle the requests from the southbound
        core.registerAdapterHandler('controller', self.controllerHandler)
        core.registerAdapterHandler('packet', self.packetHandler)
        core.registerAdapterHandler('addlink', self.addlinkHandler)
        core.registerAdapterHandler('dellink', self.dellinkHandler)
        core.registerAdapterHandler('addport', self.addportHandler)
        core.registerAdapterHandler('delport', self.delportHandler)
        core.registerAdapterHandler('adddevice', self.adddeviceHandler)
        core.registerAdapterHandler('deldevice', self.deldeviceHandler)
        core.registerAdapterHandler('addhost', self.addhostHandler)
        core.registerAdapterHandler('delhost', self.delhostHandler)
        core.registerAdapterHandler('port', self.portHandler)
        core.registerAdapterHandler('flow', self.flowHandler)

        # Send link and port info for busylink detection
        core.registerEvent('linkbag', self.sendLink, 5)
        core.registerEvent('portbag', self.sendPort, 5)

        # websocket API for WebUI
        core.registerURLApi('port', self.getPortCounter)
        core.registerURLApi('flow', self.getAllFlows)
        core.registerURLApi('flow/top', self.getTopFlows)
        core.registerURLApi('reset_datastore', self.resetDatastore)
        core.registerURLApi('addtags', self.addTags)
        core.registerURLApi('deltags', self.delTags)

        # IPC API for other modules
        core.registerIPC('getAllFlows', self.getAllFlows)
        core.registerIPC('getAllLinks', self.sendLink)
        core.registerIPC('getAllHosts', self.sendHosts)

        logger.info('Handlers and websocket APIs registered')

    def sendLink(self):
        return self.links

    def sendHosts(self):
        return self.hosts

    def sendPort(self):
        return self.portstats

    def __trigger(self, controller_ip, controller_port, adapter_port,
            controller_name):
        """Trigger controller adapter to send events to us

        The controller adapter requires a controller name. Otherwise it will
        not send any events.
        """
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


    """Southbound Event Handler
    """

    def controllerHandler(self, raw):
        """Controller information event

        Datastore: controllers <type 'dict'>
        """
        # First impression, dump all we have
        if raw == 'debut':
            result = []
            for k in self.controllers.keys():
                result.append(self.controllers[k])
            return {'controllers': result}

        # Update controllers datastore
        key = raw['controller']
        if raw != self.controllers.get(key, {}):
            self.controllers[key] = raw
        else:
            logger.debug('Controller information is not changed')
            return None
        logger.debug('Controller information: %s' % self.controllers[key])

        # Tell browser what to update
        result = json.dumps(self.controllers[key])
        return result

    def packetHandler(self, raw):
        """Packet-In event

        Datastore: packetins <type 'list'>
        """
        # First impression, dump all we have
        # XXX: Actually we do not do this because of simplicity
        if raw == 'debut':
            return None

        # Update packetins datastore
        self.packetins.append(raw)
        logger.debug('Total packet-in events: %d' % len(self.packetins))

        # Tell browser what to append
        result = json.dumps(raw)
        return result

    def addlinkHandler(self, raw):
        """Add link event

        Datastore: links <type 'dict'>
        Key: (switch_1 dpid, switch_1 port,
              switch_2 dpid, switch_2 port)
        """
        # First impression, dump all we have
        if raw == 'debut':
            return {'links': self.links.values()}

        # Filter duplicated addlink events
        key = (raw['controller'],
               raw['link'][0]['dpid'], raw['link'][0]['port'],
               raw['link'][1]['dpid'], raw['link'][1]['port'])
        rkey = (raw['controller'],
                raw['link'][1]['dpid'], raw['link'][1]['port'],
                raw['link'][0]['dpid'], raw['link'][0]['port'])
        if key in self.links or rkey in self.links:
            logger.warn('FAILED: duplicated addlink  event -> %s' % str(raw))
            return None

        # Update links datastore
        self.links[key] = raw
        logger.debug('SUCCESS: add link -> %s' % str(raw))
        logger.debug('Total links after addition: %d' % len(self.links))

        # Tell browser what to add
        result = json.dumps(self.links[key])
        return result

    def dellinkHandler(self, raw):
        """Delete link event

        Datastore: links <type 'dict'>
        Key: (switch_1 dpid, switch_1 port,
              switch_2 dpid, switch_2 port)
        """
        # First impression, do nothing
        if raw == 'debut':
            return None

        # Filter duplicated dellink events
        key = (raw['controller'],
               raw['link'][0]['dpid'], raw['link'][0]['port'],
               raw['link'][1]['dpid'], raw['link'][1]['port'])
        rkey = (raw['controller'],
                raw['link'][1]['dpid'], raw['link'][1]['port'],
                raw['link'][0]['dpid'], raw['link'][0]['port'])
        if key in self.links:
            del self.links[key]
            logger.debug('SUCCESS: del link -> %s' % str(raw))
            # Craft returned data, tell browser what to delete
            result = json.dumps({
                    'controller': raw['controller'],
                    'link': [raw['link'][0], raw['link'][1]]
                })
        elif rkey in self.links:
            del self.links[rkey]
            logger.debug('SUCCESS: del link -> %s' % str(raw))
            # Craft returned data, tell browser what to delete
            result = json.dumps({
                    'controller': raw['controller'],
                    'link': [raw['link'][1], raw['link'][0]]
                })
        else:
            logger.warn('FAILED: key of link down event not found -> %s' % str(raw))
            return None
        logger.debug('Total links after deletion: %d' % len(self.links))

        return result

    def addportHandler(self, raw):
        """Add port event

        Datastore: ports <type 'dict'>
        Key: (switch dpid, switch port)
        """
        # First impression, dump all we have
        if raw == 'debut':
            return {'ports': self.ports.values()}

        # Filter duplicated addport events
        key = (raw['controller'], raw['dpid'], raw['port'])
        if key in self.ports:
            logger.warn('FAILED: duplicated addport event -> %s' % str(raw))
            return None

        # Update ports datastore
        self.ports[key] = raw
        logger.debug('SUCCESS: add port -> %s' % str(raw))
        logger.debug('Total ports after addition: %d' % len(self.ports))

        # Tell browser what to add
        result = json.dumps(self.ports[key])
        return result

    def delportHandler(self, raw):
        """Delete port event

        Datastore: ports <type 'dict'>
        Key: (switch dpid, switch port)
        """
        # First impression, do nothing
        if raw == 'debut':
            return None

        # Filter duplicated delport events
        key = (raw['controller'], raw['dpid'], raw['port'])
        if key in self.ports:
            del self.ports[key]
            logger.debug('SUCCESS: delete port -> %s' % str(raw))
        else:
            logger.warn('FAILED: key of port down event not found -> %s' % str(raw))
            return None
        logger.debug('Total ports after deletion: %d' % len(self.ports))

        # Craft returned data, tell browser what to delete
        result = json.dumps(raw)
        return result

    def insertTags(self, node):
        if node['nodeType'] is 'switch':
            uid = node['controller'] + '@' + node['dpid']
        elif node['nodeType'] is 'host':
            uid = node['controller'] + '@' + node['mac']

        if uid in self.tags.keys():
            node['tags'] = list(self.tags[uid])

    def adddeviceHandler(self, raw):
        """Add device event

        Datastore: devices <type 'dict'>
        Key: switch dpid
        """
        # First impression, dump all we have
        if raw == 'debut':
            devices = deepcopy(self.devices.values())
            for d in devices:
                self.insertTags(d)
            return {'devices': devices}

        # Filter duplicated adddevice events
        key = (raw['controller'], raw['dpid'])
        if key in self.devices:
            logger.warn('FAILED: duplicated adddevice event -> %s' % str(raw))
            return None

        # Update devices datastore
        self.devices[key] = raw
        # Type of the device
        self.devices[key]['nodeType'] = 'switch'
        logger.debug('SUCCESS: add device -> %s' % str(raw))
        logger.debug('Total devices after addition: %d' % len(self.devices))

        # Tell browser what to add
        device = deepcopy(self.devices[key])
        self.insertTags(device)
        result = json.dumps(device)
        return result

    def deldeviceHandler(self, raw):
        """Delete device event

        Datastore: devices <type 'dict'>
        Key: switch dpid
        """
        # First impression, do nothing
        if raw == 'debut':
            return None

        # Filter duplicated deldevice events
        key = (raw['controller'], raw['dpid'])
        if key in self.devices:
            del self.devices[key]
            logger.debug('SUCCESS: delete device -> %s' % str(raw))
        else:
            logger.warn('FAILED: key of device down event not found -> %s' % str(raw))
            return None
        logger.debug('Total devices after deletion: %d' % len(self.devices))

        # Craft returned data, tell browser what to delete
        result = json.dumps(raw)
        return result

    def addhostHandler(self, raw):
        """Add host event

        Datastore: hosts <type 'dict'>
        Key: host MAC address
        """
        # First impression, dump all we have
        if raw == 'debut':
            hosts = deepcopy(self.hosts.values())
            for h in hosts:
                self.insertTags(h)
            return {'hosts': hosts}

        # Filter duplicated addhost events
        key = (raw['controller'], raw['mac'])
        if key in self.hosts.keys():
            logger.warn('FAILED: duplicated addhost event -> %s' % str(raw))
            return None

        # Update hosts datastore
        self.hosts[key] = raw
        # Type of the host
        self.hosts[key]['nodeType'] = 'host'
        logger.debug('SUCCESS: add host -> %s' % str(raw))
        logger.debug('Total hosts after addition: %d' % len(self.hosts))

        # Tell browser what to add
        host = deepcopy(self.hosts[key])
        self.insertTags(host)
        result = json.dumps(host)
        return result

    def delhostHandler(self, raw):
        """Delete host handler

        Datastore: hosts <type 'dict'>
        Key: host MAC address
        """
        # First impression, do nothing
        if raw == 'debut':
            return None

        # Filter duplicated delhost events
        key = (raw['controller'], raw['mac'])
        if key in self.hosts:
            del self.hosts[key]
            logger.debug('SUCCESS: delete host -> %s' % str(raw))
        else:
            logger.warn('FAILED: key of host down event not found -> %s' % str(raw))
            return None
        logger.debug('Total hosts after deletion: %d' % len(self.hosts))

        # Craft returned data, tell browser what to delete
        result = json.dumps(raw)
        return result

    def portHandler(self, raw):
        """Update switch port statistics event (polling)

        Datastore: portstats <type 'dict'>
        Key: (switch dpid, switch port)

        This kind of event will not sent to WebUI actively.
        """
        # First impression, do nothing
        if raw == 'debut':
            return None

        # Update portstats datastore
        key = (raw['controller'], raw['dpid'], raw['port'])
        self.portstats[key] = raw
        logger.debug('port statistics number: %d' % len(self.portstats))

        return None

    def flowHandler(self, raw):
        """Update flow table event (polling)

        Datastore: flowtables <type 'dict'>
        Key: switch dpid

        This kind of event will not sent to WebUI actively.
        """
        # First impression, do nothing
        if raw == 'debut':
            return None

        # Update portstats datastore
        key = (raw['controller'], raw['dpid'])
        sorted(raw['flows'], key=lambda k: k['counterByte'], reverse=True)
        self.flowtables[key] = {'controller': raw['controller'],
                                'dpid': raw['dpid'],
                                'flows': raw['flows']}
        logger.debug('flow entries: %d' % len(self.flowtables[key]['flows']))

        return None


    """websocket API handler
    """

    def getPortCounter(self, req):
        """Return port statistics of a specific switch port

        Usage:
            /websocket, emit('OTHER', { data:
                                  { url: 'port',
                                    request:
                                           { dpid: sw_dpid, (may empty)
                                             port: sw_port (may empty)
                                             controller: ctrl_name (may empty)
                                            }
                                  }
                             })
        Return:
            /websocket, socket.on('PORT_RESP', {data: return json})
        """
        controller = req.get('controller', None)
        dpid = req.get('dpid', None)
        port = req.get('port', None)

        if controller is None:
            return [self.portstats[(c, d, p)]
                   for (c, d, p) in self.portstats.keys()]
        if dpid != None and port != None:
            key = (controller, dpid, port)
            try:
                result = self.portstats[key]
                logger.info('Return specific controller, DPID and port\'s port statistics.')
            except KeyError as e:
                logger.warn('FAILED: key of portstats not found -> %s' % str(e))
                result = []
        elif dpid != None:
            result = [self.portstats[(c, d, p)]
                   for (c, d, p) in self.portstats.keys()
                       if c == controller and d == dpid]
            logger.info('Return specific controller and DPID port statistics.')
        elif port != None:
            result = [self.portstats[(c, d, p)]
                   for (c, d, p) in self.portstats.keys()
                       if c == controller and p == port]
            logger.info('Return specific controller and port\'s port statistics.')
        else:
            result = [self.portstats[(c, d, p)]
                   for (c, d, p) in self.portstats.keys()]
            logger.info('Return all controllers, DPID and port\'s port statistics.')

        return result

    def getAllFlows(self, req):
        """Return all flow entries of switches

        Usage:
            /websocket, socket.on('OTHER',
                                  { url: 'flow',
                                    request:
                                           { dpid: sw_dpid, (may empty)
                                             controller: ctrl_name (may empty)
                                            }
                                  })
        Return:
            /websocket, socket.on('FLOW_RESP', {data: return json})
        """
        controller = req.get('controller', None)
        dpid = req.get('dpid', None)

        if controller is None:
            return [{'controller': id[0], 'dpid': id[1], 'flows': self.flowtables[id]['flows']}
                   for id in self.flowtables.keys()]
        if dpid is not None:
            try:
                result = {'controller': controller,
                          'dpid': dpid,
                          'flows': self.flowtables[(controller, dpid)]['flows']}
                logger.info('Return specific controller and DPID flows.')
            except KeyError as e:
                logger.warn('FAILED: key of flows not found -> %s' % str(e))
                result = []
        else:
            result = [{'controller': id[0], 'dpid': id[1], 'flows': self.flowtables[id]['flows']}
                   for id in self.flowtables.keys()]
            logger.info('Return controllers and DPID flows.')

        return result

    def getTopFlows(self, req):
        """Return top flow entries of switches (default 10)

        Usage:
            /websocket, socket.on('other',
                                  { url: 'flow/top',
                                    request:
                                           { dpid: sw_dpid, (may empty)
                                             controller: ctrl_name (may empty)
                                            }
                                  })
        Return:
            /websocket, socket.on('FLOW/TOP_RESP', {data: return json})
        """
        controller = req.get('controller', None)
        dpid = req.get('dpid', None)

        if controller is None:
            return [{'controller': id[0], 'dpid': id[1], 'flows': self.flowtables[id]['flows'][0:10]}
                   for id in self.flowtables.keys()]
        if dpid is not None:
            try:
                result = {'controller': controller,
                          'dpid': dpid,
                          'flows': self.flowtables[(controller, dpid)]['flows'][0:10]}
                logger.info('Return specific controller and DPID top flows.')
            except KeyError as e:
                logger.warn('FAILED: key of flows not found -> %s' % str(e))
                result = []
        else:
            result = [{'controller': id[0], 'dpid': id[1], 'flows': self.flowtables[id]['flows'][0:10]}
                   for id in self.flowtables.keys()]
            logger.info('Return controllers and DPID top flows.')

        return result

    def resetDatastore(self, req):
        """Manually reset the datastore inside the NWInfo module

        Usage:
            /websocket, socket.on('other',
                                  { url: 'reset_datastore',
                                    request: {}
                                  })
        Return:
            /websocket, socket.on('reset_datastore', {data: return json})
        """
        self.controllers = {}
        self.packetins = []
        self.ports = {}
        self.links = {}
        self.devices = {}
        self.hosts = {}
        self.portstats = {}
        self.flowtables = {}

        result = {'status': 'OK'}

        return result

    def addTags(self, req):
        """Add tags for switches or hosts

        Usage:
            /websocket, socket.on('other',
                                  {
                                      url: 'addtags',
                                      request: {
                                          selectors: ['controller1@00:00:00:00:00:00:00:01'],
                                          tags: ['core', 'aggregate']
                                      }
                                  })
        Return:
            /websocket, socket.on('ADDTAGS_RESP', {data: return json})
        """
        selectors = req.get('selectors', [])
        tags = req.get('tags', [])

        # Iterate all selectors and set tags for them
        for s in selectors:
            # New selector in tags dict
            if not s in self.tags.keys():
                self.tags.update({s: set(tags)})
                continue

            # Add tag for the node
            for t in tags:
                self.tags[s].add(t)

        return {'status': 'OK'}

    def delTags(self, req):
        """Delete tags for switches or hosts

        Usage:
            /websocket, socket.on('other',
                                  {
                                      url: 'deltags',
                                      requeset: {
                                          selectors: ['controller1@00:00:00:00:00:00:00:01'],
                                          tags: ['core', 'aggregate']
                                      }
                                  })
        Return:
            /websocket, socket.on('DELTAGS_RESP', {data: return json})
        """
        selectors = req.get('selectors', [])
        tags = req.get('tags', [])

        # Iterate all selectors and set tags for them
        for s in selectors:
            # Add tag for the node
            for t in tags:
                try:
                    self.tags[s].remove(t)
                except KeyError:
                    logger.debug('%s tag does not exist in %s node' % (t, s))

        return {'status': 'OK'}
