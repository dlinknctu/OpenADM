import logging
from core import Core
from pymongo import MongoClient
import json
from bson import json_util
import time
import datetime
logger = logging.getLogger(__name__)


class UIPusher:
	def __init__(self,core,parm):		
		# register event handler
		core.registerEventHandler("controlleradapter", self.controllerHandler)
		# register rest api
		core.registerRestApi("topology", self.topologyHandler)
		core.registerRestApi("stat", self.statisticHandler)

		self.client = MongoClient(parm['dbip'],int(parm['dbport']))
		self.db = self.client[parm['db']]
		self.db.authenticate(parm['user'],parm['password'])
		self.intervalList=['aahourly','daily','weekly','monthly','annually']
	def topologyHandler(self):
		# return JSONP format
		return "omniui(%s);" % self.event

	def controllerHandler(self,event):
		self.event = event

	def statisticHandler(self,request):
		#parse json data
		data = json.load(request.body)
		#translate datetime to timestamp
		fromTime = int(time.mktime(time.strptime(data['from'],'%Y-%m-%d')))
		#1/26~1/27 means 1/26 00:00 to 1/27 23:59, so plus one day to toTime
		toTime = int(time.mktime(time.strptime(data['to'],'%Y-%m-%d')))+86400
		#use the interval code to obtain collection name
		interval = self.intervalList[ int(data['interval'])]

		#flow pattern,only match non-empty field
		multiGroup = {}
		output = "Time"
		count = 1
		for pattern in data['pattern']:
			output+="\t"+str(count)
			count = count +1
			group= {}
			key = {}
			for field in pattern:
				if pattern[field] !='':
					key[field] = pattern[field]
			key['date'] = {'$gte':fromTime,'$lt':toTime}
			key['dpid'] = pattern['dpid']
			#use date to group data
			for entry in self.db[interval].find(key):
				if entry['date'] in group:
					group[entry['date']] =  group[entry['date']] + entry["counterByte"]
				else:
					group[entry['date']]=   entry["counterByte"]
			#add group to multiGroup
			for date in group:
				if date in multiGroup:
					multiGroup[date].append([group[date],count-1])
				else:
					multiGroup[date]=[[group[date],count-1]]
		#tsv format  
		output+="\n"
		tmp=""
		for date in sorted(multiGroup.iterkeys()):
			tmp = datetime.datetime.fromtimestamp(date).strftime('%Y-%m-%d %H:%M')
			#insert  zero for no-traffic flow
			size = count
			tmpIndex = 0
			for index in range(1,size):
				if multiGroup[date][tmpIndex][1] == index:
					tmp+=("\t"+str(multiGroup[date][tmpIndex][0]))
					tmpIndex+=1
				else:
					pass
					tmp+=("\t0")
				if tmpIndex >= len(multiGroup[date]):
					tmpIndex = 0

			output+=tmp+"\n"
		print output
		return output

