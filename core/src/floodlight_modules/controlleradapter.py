import httplib
import logging
import json
from threading import Thread
logger = logging.getLogger(__name__)

class ControllerAdapter:
	def __init__(self,core,parm):
		""" ControllerAdapter init"""
		self.controllerIP = "localhost"
		self.controllerPort = "8080"
		self.timerInterval = 5
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
		core.registerIPC("periodicInquiry", self.periodicInquiry)

	def inquirySwitch(self):
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
			self.switches= []
			for switch in data:
				tmp = {}
				tmp['dpid'] = switch['dpid']
				tmp['flows'] = switch['flows']
				tmp['ports'] = switch['ports']
				self.switches.append(tmp)
		except Exception, e:
			logger.error("json parse error for switch: "+str(e))
	def inquiryLink(self):
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
			self.links = []
			for link in data:
				tmp = {}
				tmp['source'] = link['src-switch']
				tmp['target'] = link['dst-switch']
				tmp['sourcePort'] = link['src-port']
				tmp['targetPort'] = link['dst-port']
				self.links.append(tmp)
		except Exception, e:
			logger.error("json parse error for links: "+str(e))
	def periodicInquiry(self):
		self.inquiryLink()
		self.inquirySwitch()
		result = {}
		result['nodes'] = self.switches
		result['links'] = self.links
		return json.dumps(result, separators=(',',':'))

