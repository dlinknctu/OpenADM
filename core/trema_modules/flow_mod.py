import httplib
import json
import core


class Flow_mod:
	def __init__(self,core,parm):		
		self.IP = "localhost"
		self.Port = "8080"
		self.headers = {
			'Content-type': 'application/json',
			'Accept': 'application/json',
		}
		if parm:
			if parm.has_key("ip"):
				self.IP = parm['ip']
			if parm.has_key("port"):
				self.Port = str(parm['port'])
		# register rest api
		self.addUrl="/uds/add"
		self.delUrl="/uds/del"
		core.registerRestApi("udsadd", self.udsAddHandler)
		core.registerRestApi("udsdel", self.udsDelHandler)

	def udsAddHandler(self,request):
		data = request.body.readline()
		url = self.addUrl
		entity={}
		if not data:
			print "data is none"
			return
		else:
			entity =  json.loads(data)
		if 'match' not in entity or len(entity['match'])==0:
			return

		if 'dpid' in entity:
			url  = url + "/"+entity['dpid']
			entity.pop('dpid',None)
		else:
			url = url +"all"
		conn = httplib.HTTPConnection(self.IP,self.Port)
		conn.request('PUT',url,data,self.headers)
		response = conn.getresponse()
		ret = (response.status, response.reason, response.read())
		conn.close()
		if ret[0] != 200:
			print "add uds error"
		msg = json.dumps(ret)
		return msg

	def udsDelHandler(self,request):
		data = request.body.readline()
		url = self.delUrl
		entity={}
		if not data:
			return
		else:
			entity =  json.loads(data)
		if 'match' not in entity or len(entity['match'])==0:
			return

		if 'dpid' in entity:
			url  = url + "/"+entity['dpid']
			entity.pop('dpid',None)
		else:
			url = url +"all"
		conn = httplib.HTTPConnection(self.IP,self.Port)
		conn.request('PUT',url,data,self.headers)
		response = conn.getresponse()
		ret = (response.status, response.reason, response.read())
		conn.close()
		if ret[0] != 200:
			print "del uds error"
		msg = json.dumps(ret)
		return msg
