import logging
import json
import copy

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
matchingList = { #key: entry field.  value: don't care value.
'srcMac': '00:00:00:00:00:00', \
'dstMac': '00:00:00:00:00:00', \
'dlType': '0x0', \
'srcIP': '0.0.0.0', \
'dstIP': '0.0.0.0', \
'srcPort': '0', \
'dstPort': '0', \
'ingressPort': '0', \
'netProtocol': '0x0', \
'vlan': '0', \
'vlanP': '0', \
'tosBits': '0'
}

class Simulate:
	"""To simulate a switch's flows and retrun the path tree

		This module will use the NWIfo module,
		and calculate the flow path tree of a tree.
		It will register a websocket API to the core.
	"""

	def __init__(self, core, param):
		self.getAllFlows = core.ipcHandlers['getAllFlows']
		self.getAllLinks = core.ipcHandlers['getAllLinks']
		self.getAllHosts = core.ipcHandlers['getAllHosts']
		self.flows_data = []
		self.links_data = []
		self.hosts_data = []
		self.__registration(core)

	def __registration(self, core):
		"""Registration for websocket handler

		Handle HTTP requests from Web UI.
		"""
		# websocket API for WebUI
		core.registerURLApi('simulate', self.getFlows)

		logger.info('Handler API registered')


	"""websocket API handler
	"""
	def getFlows(self, request):
		"""Return path tree of a switch

		Usage:
			emit websocket on 'OTHER', namespace='/websocket'
			data: {
					url: 'simulate',
					request: {
							controller: ctrl_name,
							dpid: the starting simulated sw,
							flow: the rule to match
						}
					}
			this function return:
			{ controller: ctrl_name,
				path: [
					[{'dpid': src, 'port': src},
					 {'dpid': dst, 'port': dst} ],  #one path
					.....
				]
			}
			client side:
				socket on 'SIMULATE_RESP'
				{ data : json type of this function return }
		"""

		def match(packet, entry):
			"""test a entry is matched the packet or not,
				then return the priority of this entry.
				else return -1
			"""
			def matchF(packet, entry, field, value=None): # to match a field of entry
				ev = entry.get(field, None)
				if ev is not None and ev != value:
					rv = packet.get(field, None)
					if rv is not None:
						if ev != rv:
							logger.debug(field + ' not macted.')
							return False
					else:
						logger.debug("Don't have " + field + '.')
						return False

				return True

			global matchingList
			matched = True
			for key in matchingList:
				matched = matched and matchF(packet, entry, key, matchingList[key])
				if matched is False:
					return -1
			logger.debug('Matched an entry.')
			try:
				ret = int(entry.get('priority', -1))
			except:
				logger.warning('Entry has illegal priority field.')
				return -1
			return ret

		def doActions(packet, now, entry):
			"""simulate the entry's actions to the packet
			and get the next hop list from flow entry
			if not a regular flowing entry or no next hop, return None
			"""
			now_pkt = copy.deepcopy(packet) # the packet that has to do the actions
			actions = entry.get('actions', None)
			if actions is None:
				logger.warning("Entry doesn't have actions.")
				return None
			nexthop = []
			for act in actions:
				t = act.get('type', None)
				if t is None :
					logger.warning("Action doesn't have type.")
					continue
				value = act.get('value', None)
				
				# do action
				if   t == 'SET_TP_SRC':
					now_pkt['srcPort'] = value
				elif t == 'SET_TP_DST':
					now_pkt['dstPort'] = value
				elif t == 'SET_NW_SRC':
					now_pkt['srcIP'] = value
				elif t == 'SET_NW_DST':
					now_pkt['dstIP'] = value
				elif t == 'SET_DL_SRC':
					now_pkt['srcMac'] = value
				elif t == 'SET_DL_DST':
					now_pkt['dstMac'] = value
				elif t == 'SET_NW_TOS':
					now_pkt['tosBits'] = value
				elif t == 'SET_VLAN_VID':
					now_pkt['vlan'] = value
				elif t == 'SET_VLAN_PCP':
					now_pkt['vlanP'] = value
				elif t == 'STRIP_VLAN':
					now_pkt['vlan'] = None
				elif t == 'OUTPUT': # main part! find next hop
					try:
						o_port = int(value)
						i_port = int(now_pkt['ingressPort'])
					except: # None or CONTROLLER or something wrong
						logger.debug('Not legal output port or the port is CONTROLLER.')
						continue

					if o_port == -5 : # flood
						try:
							#flood to switches
							for (src_dpid, src_port, dst_dpid, dst_port) in self.links_data:
								if src_dpid == now and i_port != int(src_port):
									logger.debug('Flood out a port to switch.')
									nx_pkt = copy.deepcopy(now_pkt)
									nx_pkt['ingressPort'] = dst_port
									nexthop.append( ( [ {'dpid': src_dpid,
														 'port': src_port},
														{'dpid': dst_dpid,
														 'port': dst_port} ]
														, nx_pkt) )
							#flood to hosts
							for pair in self.hosts_data:
								host = self.hosts_data[pair]
								mac = pair[1]
								sw = host.get('location', None)
								if sw is not None and (sw.get('dpid', None) == now or\
													sw.get('elementId', None) == now):
									logger.debug('Flood out a port to host.')
									#to host, so don't need to copy packet
									nexthop.append( ( [ {'dpid': now,
														 'port': sw.get('port', '-1')},
														 {'mac': mac} ]
														, None) )
									break
						except:
							logger.warning('Get links or ingressPort error!')
					elif o_port >= 0 :
						try:
							found = False
							#output to switches
							for (src_dpid, src_port, dst_dpid, dst_port) in self.links_data:
								if src_dpid == now and o_port == int(src_port) and i_port != int(src_port):
									logger.debug('Output a port.')
									nx_pkt = copy.deepcopy(now_pkt)
									nx_pkt['ingressPort'] = dst_port
									nexthop.append( ( [ {'dpid': src_dpid,
														 'port': src_port},
														{'dpid': dst_dpid,
														 'port': dst_port} ]
														, nx_pkt) )
									found = True
									break
							#output to hosts
							if not found:
								for pair in self.hosts_data:
									host = self.hosts_data[pair]
									mac = pair[1]
									sw = host.get('location', None)
									if sw is not None and (sw.get('dpid', None) == now or\
														sw.get('elementId', None) == now) and \
														int(sw.get('port', -5566)) == o_port:
										logger.debug('Flood out a port to host.')
										#to host, so don't need to copy packet
										nexthop.append( ( [ {'dpid': now,
															 'port': str(o_port)},
															 {'mac': mac} ]
															, None) )
										break
						except:
							logger.warning('Get links or ingressPort error!')
					else:
						logger.debug('None support output port: ' + str(o_port) + '.')
				else:
					logger.info("Don't support this action type: " + t + '.')

			return nexthop

		#======== start from here ========
		dpid = request.get('dpid', None) # the simulation starting switch
		rule = request.get('flow', None) # the rule to match
		ctrl = request.get('controller', None)
		if dpid is None or rule is None or ctrl is None:
			logger.warning('Simulate request format error.')
			return []
			
		self.flows_data = self.getAllFlows( {'controller':ctrl} ) # get all switches' flow tables
		links = self.getAllLinks() # be aware that these links are non-directional
		if len(self.flows_data) <= 0 or len(links) <= 0: # get failed
			logger.info('Now the flows or links are empty.')
			return []
		self.links_data = [] #reset
		for (lctrl, sid, sp, did, dp) in links:
			if lctrl == ctrl:
				self.links_data.append( (sid, sp, did, dp) )
				#self.links_data.append( (did, dp, sid, sp) ) #reverse to let it be directional
		self.hosts_data = self.getAllHosts()

		#Now use BFS-like to visit all related switches
		p = copy.deepcopy(rule) # simulating a packet through the BFS
		q = [ (dpid, p) ] # waiting queue
		#v = {} # visitted nodes   ### loop should be avoided by controller app, not this file
		paths = [] # return paths 

		flows = {}
		for node in self.flows_data: # generate a dict to speed up searching
			value = node.get('flows', None)
			key = node.get('dpid', None)
			if value is not None and key is not None:
				flows[key] = value
				#v[key] = False

		while len(q) > 0: # BFS-like
			now_p = q.pop(0)
			now = now_p[0]
			#v[now] = True
			pkt = now_p[1]
			entries = flows.get(now, None)
			if entries is None or pkt is None:
				logger.warning('Get entry from queue failed')
				continue

			priority = {}
			max_p = 0
			i = 0
			for entry in entries : # find the highest priority matched rules
				p = match(pkt, entry)
				if p > max_p :
					max_p = p
				priority[i] = p
				entry['p_id'] = i
				i = i + 1

			for entry in entries :
				if priority.get(entry.get('p_id', -1), -1) >= max_p: # this rule will match
					pathl = doActions(pkt, now, entry) # get the next dst dpid list
					if pathl is None :
						logger.debug('Matched entry has no next hop')
						continue
					for nx in pathl: # use list because maybe it floods
						path = nx[0]
						nx_pkt = nx[1]
						if len(path) > 1:
							paths.append(path)
							dst_dpid = path[1].get('dpid', None)
							if dst_dpid is not None: #to sw
								#if not v.get(dst_dpid, True):
								#	q.append((dst_dpid, nx_pkt))
								q.append( (dst_dpid, nx_pkt) )

		return {'controller': ctrl, 'path': paths}

