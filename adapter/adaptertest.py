import json
import urllib2
CONTROLLER="localhost"
PORT="8080"
class AdapterTest():
	def __init__(self):
		
		#initial Floodlight Rest URL
		#self.switchUrl="http://"+CONTROLLER+":"+PORT+"/wm/core/controller/switches/json"
		self.switchUrl="http://"+CONTROLLER+":"+PORT+"/wm/omniui/switch/json"
		self.linkUrl="http://"+CONTROLLER+":"+PORT+"/wm/omniui/link/json"
	def askSwitch(self):
		try: 
			response = urllib2.urlopen(self.switchUrl).read()
		except:
			print "connection error"
			return
		try:
			response = json.loads(response)
			self.switch=[]
			#get switch flow table infomation	
			print len(response)
			for a in response:
				tmp = {}
				tmp['ports'] = a['ports']
				tmp['dpid'] = a['dpid']
				tmp['flows'] = a['flows']
				self.switch.append(tmp)
		except:
			print "json parse switch infomation fail"
			return 
	def askLink(self):
		try: 
			response = urllib2.urlopen(self.linkUrl).read()
		except:
			print "connection error"
			return
		try:
			response = json.loads(response)
			#match the floodlight link format to our json format
			self.link=[]	
			for link in response:
				tmp = {}
				tmp['source'] = link['src-switch']
				tmp['target'] = link['dst-switch']
				tmp['sourcePort'] = link['src-port']
				tmp['targetPort'] = link['dst-port']
				self.link.append(tmp)
		except:
			print "json parse Link infomation fail"
			return 
	def outputJson(self):
		tmp ={}
		tmp['nodes'] = self.switch
		tmp['links'] = self.link
		print json.dumps(tmp,indent=4)		


test = AdapterTest()
test.askSwitch()
test.askLink()
test.outputJson()
