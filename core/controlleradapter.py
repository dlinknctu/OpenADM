import urllib2
import logging
import json
import time
from threading import Thread
logger = logging.getLogger(__name__)

class ControllerAdapter:
	def __init__(self,ip,port,interval):
		logger.debug('IP =%s  port = %s  interval = %s' % (ip,port,interval))
		self.controllerIP = ip
		self.controllerPort = port
		self.timerInterval = int(interval)
		self.switchUrl="http://"+self.controllerIP+":"+self.controllerPort+"/wm/omniui/switch/json"
		self.linkUrl="http://"+self.controllerIP+":"+self.controllerPort+"/wm/omniui/link/json"
		self.switches=[]
		self.links=[]
		self.inquiryHandler=[]
	def inquirySwitch(self):
		try:
			response = urllib2.urlopen(self.switchUrl).read()
		except KeyboardInterrupt:
			raise KeyboardInterrupt
		except:
			logger.error("connection error for inquiring switches")
			return
		try:
			data = json.loads(response)
			self.switches=[]
			for switch in data:
				tmp = {}
				tmp['dpid'] = switch['dpid']
				tmp['flows'] = switch['flows']
				tmp['ports'] = switch['ports']
				self.switches.append(tmp)
		except:
			logger.error("json parse error for switch")
	def inquiryLink(self):
		try:
			response = urllib2.urlopen(self.linkUrl).read()
		except KeyboardInterrupt:
			raise KeyboardInterrupt
		except:
			logger.error("connection error for inquiring switches")
			return
		try:
			data = json.loads(response)
			self.links=[]
			for link in data:
				tmp = {}
				tmp['source'] = link['src-switch']
				tmp['target'] = link['dst-switch']
				tmp['sourcePort'] = link['src-port']
				tmp['targetPort'] = link['dst-port']
				self.links.append(tmp)
		except:
			logger.error("json parse error for links")
	def periodicInquiry(self):
		try:
			while True:
				self.inquiryLink()
				self.inquirySwitch()
				self.notifyHandler()
				time.sleep(self.timerInterval)
		except KeyboardInterrupt:
			print "receive Ctrl+C, terminate process"
	def register_Topology_Request(self,handler):
		self.inquiryHandler.append(handler)
	def notifyHandler(self):
		for handler in self.inquiryHandler:
			handler(self.switches,self.links)
