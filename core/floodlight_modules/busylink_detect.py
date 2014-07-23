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
		self.statistics = {}
		self.BLD_result = []
		self.linkcapacity = 10737418240.0 	#10G

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
		if link['state'] >= 3:
			print "%s is busy!!!!!!!!" % id
			link['state'] = 3
			self.BLD_result.append(id)
		#print "overthreshold!!!!!! state = %d" % link['state']
	
	def underthreshold(self,link):
		link['state'] -= 1
		if link['state'] <= 0:
			link['state'] = 1
		#print "underthreshold!!!!!! state = %d" % link['state']
	
	def periodicQuery(self):
		self.periodicQueryLink()
		self.periodicQueryPort()
	
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
		#calculate link's countBytes
		for link_id in self.links:
			link = self.links[link_id]
			src = link['source']
			srcp = link['sourcePort']
			dest = link['target']
			destp = link['targetPort']
			total_bytes = self.switches[src][srcp] + self.switches[dest][destp]
			link['countBytes'] = total_bytes
		
		#initialize self.statistics value
		if len(self.statistics) == 0:
			self.statistics = dict(self.links)
			for link_id in self.statistics:
				link = self.statistics[link_id]
				link['state'] = 1
		
		#check threshold
		for link_id in self.links:
			if link_id in self.statistics:
				if (self.links[link_id]['countBytes'] - self.statistics[link_id]['countBytes']) / self.linkcapacity >= 0.8:
					self.overthreshold(self.statistics[link_id],link_id)
				else:
					self.underthreshold(self.statistics[link_id])
				self.statistics[link_id]['countBytes'] = self.links[link_id]['countBytes']
			else:
				self.statistics[link_id] = dict(self.links[link_id])
				self.statistics[link_id]['state'] = 1
		
		#return result
		if len(self.BLD_result)>0:
			print self.BLD_result