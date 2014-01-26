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
		
		##db test
		self.client = MongoClient("140.113.215.200",27017)
		self.db = self.client.omniui
		self.hourly = self.db.hourly

		self.intervalList=['hourly','daily','weekly','monthly','annually']


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
		pattern = data['pattern']
		key = {}
		for field in pattern:
			if pattern[field] !='':
				key[field] = pattern[field]
		key['date'] = {'$gte':fromTime,'$lt':toTime}
		if data['dpid'] !='':
			key['dpid'] = data['dpid']
		#use date to group data
		group= {}
		for entry in self.db[interval].find(key):
			if entry['date'] in group:
				group[entry['date']] =  group[entry['date']] + entry["counterByte"]
			else:
				group[entry['date']]=   entry["counterByte"]

		#tsv format  
		output = "Time\tByte\n"
		for date in sorted(group.iterkeys()):
			tmp="{0}\t{1}\n".format(datetime.datetime.fromtimestamp(date).strftime('%Y-%m-%d %H:%M'),str(group[date]))
			output+=tmp
		return output
