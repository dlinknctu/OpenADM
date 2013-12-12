import urllib2
import logging
import json
from threading import Thread
import core
logger = logging.getLogger(__name__)



class ControllerAdapter:
	def __init__(self,core,parm):
		#members
		self.controllerIP = "localhost"
		self.controllerPort = "8080"
		self.timerInterval = 5
		self.switchUrl="http://"+self.controllerIP+":"+self.controllerPort+"/wm/omniui/switch/json"
		self.linkUrl="http://"+self.controllerIP+":"+self.controllerPort+"/wm/omniui/link/json"
		self.switches=[]
		self.links=[]
		self.inquiryHandler=[]

		#load config
		if(parm):
			if(parm.has_key("ip")):
				self.controllerIP = parm["ip"]
			if(parm.has_key("port")):
				self.controllerPort = parm["port"]
			if(parm.has_key("interval")):
				self.timerInterval = int(parm["interval"])
		logger.debug('IP =%s  port = %s  interval = %s' % (self.controllerIP,self.controllerPort,self.timerInterval))
		core.registerEvent("controlleradapter",self.periodicInquiry,self.timerInterval)
	def inquirySwitch(self):
		try:
			response = urllib2.urlopen(self.switchUrl).read()
		except:
			logger.error("connection error for inquiring switches")
			return
		try:
			data = json.loads(response)
			self.switches= []
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
		except:
			logger.error("connection error for inquiring links")
			return
		try:
			data = json.loads(response)
			self.links = []
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
		self.inquiryLink()
		self.inquirySwitch()
		result = {}
		result['nodes'] = self.switches
		result['links'] = self.links
		return json.dumps(result, separators=(',',':'))
