import httplib
import json


class Flow_mod:
	def __init__(self,core,parm):		
		
		self.IP = "localhost"
		self.Port = "8080"
		self.path = '/wm/omniui/add/json'
		self.headers = {
            		'Content-type': 'application/json',
            		'Accept': 'application/json',
            	}
		# register websocket api
		self.Url="http://"+self.IP+":"+self.Port+"/wm/omniui/add/json"
		core.registerURLApi("flowmod", self.flowHandler)

	def flowHandler(self,body):
		# return JSONP format
		conn = httplib.HTTPConnection(self.IP,self.Port)
		conn.request('POST',self.path,body,self.headers)
		response = conn.getresponse()
		ret = (response.status, response.reason, response.read())
		ret[0] == 200
		conn.close()
		msg = json.dumps(ret)
		return msg
