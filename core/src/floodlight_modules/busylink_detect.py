import httplib
import logging
import json
import core
logger = logging.getLogger(__name__)

class BusyLink_Detect:
	def __init__(self,core,parm):
		""" BusyLinkDetect init"""
		self.controllerIP = "localhost"
		self.controllerPort = "8080"
		self.timerInterval = 5

		self.baseState = 1
		self.finalState = 3
		self.threshold = 0.8
		self.statistics = {}
		self.BLD_result = []

		#load config
		if(parm):
			if(parm.has_key("ip")):
				self.controllerIP = parm["ip"]
			if(parm.has_key("port")):
				self.controllerPort = parm["port"]
			if(parm.has_key("interval")):
				self.timerInterval = int(parm["interval"])
		logger.debug('IP =%s  port = %s  interval = %s' % (self.controllerIP,self.controllerPort,self.timerInterval))
		core.registerEvent("periodicQuery",self.periodicQuery,self.timerInterval)
		core.registerEventHandler("periodicQuery", self.busyLinkDetect)
	
	def overthreshold(self,link,id):
		link['state'] += 1
		if link['state'] >= self.finalState:
			print "%s is busy!!!!!!!!" % id
			link['state'] = self.finalState
			self.BLD_result.append(id)
		#print "overthreshold!!!!!! state = %d" % link['state']
	
	def underthreshold(self,link):
		link['state'] -= 1
		if link['state'] < self.baseState:
			link['state'] = self.baseState
		#print "underthreshold!!!!!! state = %d" % link['state']
	
	def periodicQuery(self):
		self.periodicQueryLink()
		self.periodicQueryPort()
	
	def parsePortFeatures(self,features):
		if features == 0:
			return 0
		turn_binary = bin(features)[2:]
		binary_len = len(turn_binary)
		if binary_len < 12:
			turn_binary = '0'*(12-binary_len) + turn_binary
		
		if turn_binary[5] == '1':
			return 10*(1024**3)/8.0			#10Gb
		if turn_binary[6] == '1' or turn_binary[7] == '1':
			return 1024**3/8.0				#1Gb
		if turn_binary[8] == '1' or turn_binary[9] == '1':
			return 100*(1024**2)/8.0		#100Mb
		if turn_binary[10] == '1' or turn_binary[11] == '1':
			return 10*(1024**2)/8.0			#10Mb
		return 0
		
	def queryLinkCapacity(self):
		try:
			conn = httplib.HTTPConnection(self.controllerIP, int(self.controllerPort))
			conn.request("GET", "/wm/core/switch/all/features/json")
			response = conn.getresponse().read()
		except Exception, e:
			logger.error("connection error for inquiring features: "+str(e))
			return
		finally:
			conn.close()
		try:
			data = json.loads(response)
			self.capacity = {}
			for switch_id in data:
				switch = data[switch_id]
				ports = switch['ports']
				for port in ports:
					result = self.parsePortFeatures(port['currentFeatures'])
					self.capacity["%s_%d" % (switch_id,port['portNumber'])] = result
		except Exception, e:
			logger.error("json parse error for features: "+str(e))
		
	def periodicQueryLink(self):
		try:
			conn = httplib.HTTPConnection(self.controllerIP, int(self.controllerPort))
			conn.request("GET", "/wm/omniui/link/json")
			response = conn.getresponse().read()
		except Exception, e:
			logger.error("connection error for inquiring links: "+str(e))
			return
		finally:
			conn.close()
		try:
			data = json.loads(response)
			self.links = {}
			for link in data:
				tmp = {}
				tmp['source'] = link['src-switch']
				tmp['target'] = link['dst-switch']
				tmp['sourcePort'] = link['src-port']
				tmp['targetPort'] = link['dst-port']
				id = "dpid %s, port %s -- dpid %s, port %s" % (tmp['source'],tmp['sourcePort'],tmp['target'],tmp['targetPort'])
				self.links[id] = tmp
		except Exception, e:
			logger.error("json parse error for links: "+str(e))
		self.queryLinkCapacity()
	
	def periodicQueryPort(self):
		try:
			conn = httplib.HTTPConnection(self.controllerIP, int(self.controllerPort))
			conn.request("GET", "/wm/omniui/switch/json")
			response = conn.getresponse().read()
		except Exception, e:
			logger.error("connection error for inquiring switches: "+str(e))
			return
		finally:
			conn.close()
		try:
			data = json.loads(response)
			self.switches= {}
			for switch in data:
				tmp = {}
				for port in switch['ports']:
					tmp[port['PortNumber']] = port['recvBytes']
				self.switches[switch['dpid']] = tmp
		except Exception, e:
			logger.error("json parse error for switch: "+str(e))
	
	def busyLinkDetect(self,event):
		self.BLD_result = []
		#calculate link's countBytes and capacity
		for link_id in self.links:
			link = self.links[link_id]
			src = link['source']
			srcp = link['sourcePort']
			dest = link['target']
			destp = link['targetPort']
			total_bytes = self.switches[src][srcp] + self.switches[dest][destp]
			link['countBytes'] = total_bytes
			link['capacity'] = min(self.capacity["%s_%d" % (src,srcp)],self.capacity["%s_%d" % (dest,destp)])
		
		#initialize self.statistics value
		if len(self.statistics) == 0:
			self.statistics = dict(self.links)
			for link_id in self.statistics:
				link = self.statistics[link_id]
				link['state'] = self.baseState
		
		#check threshold
		for link_id in self.links:
			if link_id in self.statistics:
				if (self.links[link_id]['countBytes'] - self.statistics[link_id]['countBytes']) / self.statistics[link_id]['capacity'] >= self.threshold:
					self.overthreshold(self.statistics[link_id],link_id)
				else:
					self.underthreshold(self.statistics[link_id])
				self.statistics[link_id]['countBytes'] = self.links[link_id]['countBytes']
			else:
				self.statistics[link_id] = dict(self.links[link_id])
				self.statistics[link_id]['state'] = self.baseState
		#remove unexisted link info
		for link_id in self.statistics:
			if link_id not in self.links:
				del self.statistics[link_id]
		
		#return result
		if len(self.BLD_result)>0:
			print self.BLD_result
