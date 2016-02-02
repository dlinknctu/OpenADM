import httplib
import logging
import json
logger = logging.getLogger(__name__)

class BusyLink_Detect:
	def __init__(self,core,parm):
		""" BusyLinkDetect init"""
		self.coreIP = "localhost"
		self.corePort = "5567"

		self.baseState = 1
		self.finalState = 3
		self.threshold = 0.000001
		self.statistics = {}
		self.capacity = {}
		self.links = {}
		self.switches = {}
		self.BLD_result = []

		core.registerEventHandler("linkbag", self.getLink)
		core.registerEventHandler("portbag", self.getPort)

	def getLink(self, linksbag):
		#print '----------links----------'
		#print json.dumps(linksbag.values())

		try:
			data = linksbag.values()
			self.links = {}
			for link in data:
				tmp = {}
				tmp['source'] = link[0]['dpid']
				tmp['target'] = link[1]['dpid']
				tmp['sourcePort'] = int(link[0]['port'])
				tmp['targetPort'] = int(link[1]['port'])
				id = "dpid %s, port %d -- dpid %s, port %d" % (tmp['source'], tmp['sourcePort'], tmp['target'], tmp['targetPort'])
				self.links[id] = tmp
		except Exception, e:
			logger.error("json parse error for links: "+str(e))

	def getPort(self, portsbag):
		#print '----------ports----------'
		#print json.dumps(portsbag.values())

		try:
			data = portsbag.values()
			self.capacity = {}
			self.switches = {}
			for port in data:
				self.capacity["%s_%d" % (port['dpid'],int(port['port']))] = self.parsePortFeatures(int(port['capacity']))
				if port['dpid'] in self.switches:
					self.switches[port['dpid']][int(port['port'])] = int(port['rxbyte'])
				else:
					self.switches[port['dpid']] = {}
					self.switches[port['dpid']][int(port['port'])] = int(port['rxbyte'])
		except Exception, e:
			logger.error("json parse error for switch and features: "+str(e))

		self.busyLinkDetect()

	def overthreshold(self,id):
		self.statistics[id]['state'] += 1
		if self.statistics[id]['state'] >= self.finalState:
			self.statistics[id]['state'] = self.finalState
			self.BLD_result.append(id)
	
	def underthreshold(self,id):
		self.statistics[id]['state'] -= 1
		if self.statistics[id]['state'] < self.baseState:
			self.statistics[id]['state'] = self.baseState
	
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

	def busyLinkDetect(self,event):
		self.BLD_result = []
		#calculate link's countBytes and capacity
		for link_id in self.links:
			src = self.links[link_id]['source']
			srcp = self.links[link_id]['sourcePort']
			dest = self.links[link_id]['target']
			destp = self.links[link_id]['targetPort']
			total_bytes = self.switches[src][srcp] + self.switches[dest][destp]
			self.links[link_id]['countBytes'] = total_bytes
			self.links[link_id]['capacity'] = min(self.capacity["%s_%d" % (src,srcp)],self.capacity["%s_%d" % (dest,destp)])
		
		#initialize self.statistics value
		if len(self.statistics) == 0:
			self.statistics = dict(self.links)
			for link_id in self.statistics:
				self.statistics[link_id]['state'] = self.baseState
		
		#check threshold
		for link_id in self.links:
			if link_id in self.statistics:
				if (self.links[link_id]['countBytes'] - self.statistics[link_id]['countBytes']) / self.statistics[link_id]['capacity'] >= self.threshold:
					self.overthreshold(link_id)
				else:
					self.underthreshold(link_id)
				self.statistics[link_id]['countBytes'] = self.links[link_id]['countBytes']
			else:
				self.statistics[link_id] = dict(self.links[link_id])
				self.statistics[link_id]['state'] = self.baseState
		#remove unexisted link info
		for link_id in self.statistics:
			if link_id not in self.links:
				del self.statistics[link_id]
		
		#return result
		if len(self.BLD_result) > 0:
			data = {}
			for i in range(len(self.BLD_result)):
				data[i] = self.BLD_result[i]

			print '*****Busy Link ID*****'
			print json.dumps(data)
			#conn = httplib.HTTPConnection(self.coreIP,self.corePort)
			#conn.request('POST','/publish/busylink')
