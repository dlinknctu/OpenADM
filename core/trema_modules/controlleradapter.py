import httplib
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

		#load config
		if(parm):
			if(parm.has_key("ip")):
				self.controllerIP = parm["ip"]
			if(parm.has_key("port")):
				self.controllerPort = parm["port"]
			if(parm.has_key("interval")):
				self.timerInterval = int(parm["interval"])

		self.udsUrl="http://"+self.controllerIP+":"+self.controllerPort+"/uds/getall"
		logger.debug('IP =%s  port = %s  interval = %s' % (self.controllerIP,self.controllerPort,self.timerInterval))
		core.registerEvent("controlleradapter",self.periodicInquiry,self.timerInterval)
		core.registerIPC("periodicInquiry", self.periodicInquiry)

	def processMask(self,data,key):
		if key in data and '/' in data[key]:
			index = data[key].index('/')
			data[key+'_mask'] = data[key][index+1:]
			data[key] = data[key][:index]

	def processOF13Mask(self,data):
		self.processMask(data,"eth_src")
		self.processMask(data,"eth_dst")
		self.processMask(data,"vlan_vid")
		self.processMask(data,"ipv4_src")
		self.processMask(data,"ipv4_dst")
		self.processMask(data,"arp_spa")
		self.processMask(data,"arp_tpa")
		self.processMask(data,"arp_sha")
		self.processMask(data,"arp_tha")
		self.processMask(data,"ipv6_src")
		self.processMask(data,"ipv6_dst")
		self.processMask(data,"ipv6_flabel")
		self.processMask(data,"ipv6_exthdr")
		self.processMask(data,"pbb_idis")
		self.processMask(data,"thnnel_id")

	def periodicInquiry(self):
		try:
			conn = httplib.HTTPConnection(self.controllerIP, int(self.controllerPort))
			conn.request('GET', "/uds/getall")
			response = conn.getresponse().read()
			if response == "null" or response == "[ ]":
				result = {}
				return json.dumps(result,separators=(',',':'))
			data = json.loads(response)
			self.uds=[]
			for switch in data:
				tmp = {}
				tmp['dpid'] = switch['datapath']
				tmp['flows'] = switch['flows']
				for flow in tmp['flows']:
					self.processOF13Mask(flow)
				self.uds.append(tmp)
			result = {}
			result['nodes'] = self.uds
			return json.dumps(result,separators=(',',':'))
		except Exception,e:
			print "{} for {}".format(str(e),self.udsUrl)
			logger.debug("connection error for uds"+str(e))
			result = {}
			return json.dumps(result,separators=(',',':'))
