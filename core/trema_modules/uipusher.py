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
		# register sse handler
		core.registerSSEHandler('updateuds', self.udsHandler)
		core.registerRestApi("stat", self.statisticHandler)
		# save core for ipc use
		self.core = core

		self.intervalList=['uds_hourly','uds_daily','uds_weekly','uds_monthly','uds_annually']
		self.intervalList[0] = 'uds_hourly'+str(datetime.datetime.today().strftime("%Y_%m_%d"))
		self.enable = True if parm['enable'] == "true" or parm['enable'] == "True"  else False

		self.limit = int(parm['queryinterval'])
		self.count = 0
		self.prevTime = time.time()
		self.cache = {}
		self.diff = {}
		self.tmpcache = {}
		if self.enable:
			try:
				self.client = MongoClient(parm['dbip'],int(parm['dbport']))
				self.db = self.client[parm['db']]
				self.db.authenticate(parm['user'],parm['password'])
			except:
				print "database connection failed"

	def udsHandler(self):
		# return JSON format
		result = self.core.invokeIPC("periodicInquiry")
		return result

	def controllerHandler(self,event):
		if event is None or event == "{}":
			# print "no data get from controller"
			return
		if self.enable:
			#compute timestamp 
			now = time.time()
			#12:35:39 -> 12:30:00 
			reduntTime = int(datetime.datetime.fromtimestamp(now).strftime('%M'))%10*60 + int(datetime.datetime.fromtimestamp(now).strftime('%S'))
			data = json.loads(event)
			self.count = self.count + 1
			if int(now-reduntTime) != self.prevTime:
				self.writeToDB()
			for node in data['nodes']:
				for flow in node['flows']:
					flow['byte_count'] = int(flow['byte_count'])
					flow['packet_count'] = int(flow['packet_count'])
					key=flow.copy()
					key.pop("byte_count",None)
					key.pop("packet_count",None)
					key.pop("duration",None)
					#key['actions'] = "".join(["{0}:{1}".format(dic['type'],dic['value']) for dic in key['actions']])
					key['dpid'] = str(node['dpid'])
					key['date'] = int(now - reduntTime)
					hashkey = frozenset(key.items())
	#				print hashkey
					if hashkey in self.cache:
						if self.diff[hashkey][2] > flow['duration']:
							tmpCB = flow['byte_count']
							tmpCP = flow['packet_count']
						else:
							tmpCB = flow['byte_count'] - self.diff[hashkey][0]
							tmpCP = flow['packet_count'] - self.diff[hashkey][1]
						self.cache[hashkey][0] += tmpCB
						self.cache[hashkey][1] += tmpCP
						self.cache[hashkey][2] = key
						self.cache[hashkey][3] = flow['duration']
						self.diff[hashkey][0] = flow['byte_count']
						self.diff[hashkey][1] = flow['packet_count']
						self.diff[hashkey][2] = flow['duration']
					else:
						self.cache[hashkey] = [0,0,key,flow['duration']]
						self.diff[hashkey] = [flow['byte_count'],flow['packet_count'],flow['duration']]
			self.prevTime = int(now-reduntTime)
			if self.count >= self.limit and len(self.cache) > 0:
				self.writeToDB()
		self.event = event
	def writeToDB(self):
		self.count = 0
		#access database
		self.tmpcache = self.cache
		self.cache={}
		key={}
		if len(self.tmpcache)==0:
			return
		##update db name
		prevTime = datetime.datetime.fromtimestamp(self.prevTime).strftime("%Y_%m_%d")
		self.intervalList[0] = 'uds_hourly'+str(prevTime)
		print "write data to "+str(self.intervalList[0])
		for hashkey in self.tmpcache:
			key = self.tmpcache[hashkey][2]
			exist = self.db[self.intervalList[0]].find_one(key)
			if exist is not None:
				key['_id'] = exist['_id']
				key['byte_count'] = self.tmpcache[hashkey][0] + exist['byte_count']
				key['packet_count'] = self.tmpcache[hashkey][1] + exist['packet_count']
			else:
				key['byte_count'] = self.tmpcache[hashkey][0]
				key['packet_count'] = self.tmpcache[hashkey][1]
			key['duration'] = self.tmpcache[hashkey][3]
			self.db[self.intervalList[0]].save(key)

	def statisticHandler(self,request):
		if self.enable == False:
			return "Time\t1\n"
		
		#parse json data
		data = request.get_json(force=True)
		#declare variable
		multiGroup = {}
		output = "Time"
		count = 1
		# for hourly query
		if int(data['interval']) ==0:
			fromTime =	datetime.datetime.strptime(data['from'],"%Y-%m-%d")
			toTime =	datetime.datetime.strptime(data['to'],"%Y-%m-%d")
			oneday = datetime.timedelta(days=1)
			#1/26~1/27 means 1/26 00:00 to 1/27 23:59, so plus one day to toTime
			toTime = toTime + oneday
			keys=[]

			for pattern in data['pattern']:
				output+="\t"+str(count)
				count = count +1
				key={}
				for field in pattern:
					if pattern[field] !='':
						key[field] = pattern[field]
				currentTime = fromTime
				group= {}
				while currentTime != toTime:
					tableName = "uds_hourly"+currentTime.strftime("%Y_%m_%d")
					currentTime = currentTime + oneday
					for entry in self.db[tableName].find(key):
						if entry['date'] in group:
							group[entry['date']] = group[entry['date']] + entry["byte_count"]
						else:
							group[entry['date']] = entry["byte_count"]
				for date in group:
					if date in multiGroup:
						multiGroup[date].append([group[date],count-1])
					else:
						multiGroup[date]=[[group[date],count-1]]
		# for weekly,monthly...
		else:
			#translate datetime to timestamp
			fromTime = int(time.mktime(time.strptime(data['from'],'%Y-%m-%d')))
			#1/26~1/27 means 1/26 00:00 to 1/27 23:59, so plus one day to toTime
			toTime = int(time.mktime(time.strptime(data['to'],'%Y-%m-%d')))+86400
			#use the interval code to obtain collection name
			interval = self.intervalList[ int(data['interval'])]
	
			#flow pattern,only match non-empty field
			for pattern in data['pattern']:
				output+="\t"+str(count)
				count = count +1
				group= {}
				key = {}
				for field in pattern:
					if pattern[field] !='':
						key[field] = pattern[field]
				key['date'] = {'$gte':fromTime,'$lt':toTime}
				#use date to group data
				for entry in self.db[interval].find(key):
					if entry['date'] in group:
						group[entry['date']] = group[entry['date']] + entry["byte_count"]
					else:
						group[entry['date']] = entry["byte_count"]
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

