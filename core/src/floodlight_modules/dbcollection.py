from pymongo import MongoClient
import datetime,time,calendar

class DbCollection:
	def __init__(self,core,parm):
		#	membeRs
		self.timeInterval = int(parm['interval'])
		self.prevDay  = datetime.datetime.today() 
		self.prevWeekDay  = datetime.datetime.today() 
		self.prevMonth = datetime.datetime.today()
		self.prevYear = datetime.datetime.today()
		self.enable = True if parm['enable'] == "true" or parm['enable'] == "True"  else False
		self.isconnect = False
		#	register event
		core.registerEvent("dbcollection",self.dbcollection,self.timeInterval)
		#	connect to db
		if self.enable:
			try:
				self.client = MongoClient(parm['dbip'],int(parm['dbport']))
				self.db = self.client[parm['db']]
				self.db.authenticate(parm['user'],parm['password'])
				self.isconnect = True
			except:
				print "database connection failed for dbconnection"

	def dbcollection(self):
		if self.isconnect and self.enable:
			self.hourlyToDaily()
			self.dailyToWeekly()
			self.weeklyToMonthly()
			self.monthlyToAnnually()
	def hourlyToDaily(self):
		today = datetime.datetime.today() 
		tableName =	"hourly"+self.prevDay.strftime("%Y_%m_%d")
		for entry in self.db[tableName].find():
			key = entry.copy()
			key.pop('counterByte',None)
			key.pop('counterPacket',None)
			key.pop('duration',None)
			key.pop('_id',None)
			key['date'] = int(time.mktime(datetime.datetime.strptime(self.prevDay.strftime("%Y_%m_%d"),"%Y_%m_%d").timetuple()))
			exist =  self.db['daily'].find_one(key)
			if exist is not None:
				key['_id'] = exist['_id']
				key['counterByte'] = entry['counterByte'] + exist['counterByte']
			else:
				key['counterByte'] = entry['counterByte']
			self.db['daily'].save(key)
			
		self.prevDay = today
	def dailyToWeekly(self):
		today = datetime.datetime.today() 
		#update the daily to weekly every sunday
		#update the prevWeekDay ~ today
		if today.weekday() == calendar.SUNDAY:
			fromTime = int(time.mktime(datetime.datetime.strptime(self.prevWeekDay.strftime("%Y_%m_%d"),"%Y_%m_%d").timetuple()))
			toTime = int(time.mktime(today.strptime(today.strftime("%Y_%m_%d"),"%Y_%m_%d").timetuple()))
			key={}
			key['date'] = {'$gte':fromTime,'$lt':toTime}
			for entry in self.db['daily'].find(key):
				key = entry.copy()
				key.pop('counterByte',None)
				key.pop('counterPacket',None)
				key.pop('duration',None)
				key.pop('_id',None)
				key['date'] = toTime - 86400*7 #last sunday
				exist = self.db['weekly'].find_one(key)
				if exist is not None:
					key['_id'] = exist['_id']
					key['counterByte'] = entry['counterByte'] + exist['counterByte']
				else:
					key['counterByte'] = entry['counterByte']
				self.db['weekly'].save(key)
			self.prevWeekDay = today		

	def weeklyToMonthly(self):
		# still use the daily to translate.
		today = datetime.datetime.today()
		if today.month != self.prevMonth.month:
			self.prevMonth = datetime.datetime.strptime(self.prevMonth.strftime("%Y_%m"),"%Y_%m")
			fromTime = int(time.mktime(self.prevMonth.timetuple()))
			toTime = int(time.mktime((self.prevMonth + datetime.timedelta(calendar.mdays[self.prevMonth.month])).timetuple()))
			key={}
			key['date'] = {'$gte':fromTime,'$lt':toTime}
			for entry in self.db['daily'].find(key):
				key = entry.copy()
				key.pop('counterByte',None)
				key.pop('counterPacket',None)
				key.pop('duration',None)
				key.pop('_id',None)
				key['date'] = fromTime
				exist = self.db['monthly'].find_one(key)
				if exist is not None:
					key['_id'] = exist['_id']
					key['counterByte'] = entry['counterByte'] + exist['counterByte']
				else:
					key['counterByte'] = entry['counterByte']
				self.db['monthly'].save(key)
			self.prevMonth = today
	def monthlyToAnnually(self):
		today = datetime.datetime.today()
		if today.year != self.prevYear.year:
			self.prevYear = datetime.datetime.strptime(self.prevYear.strftime("%Y"),"%Y")
			fromTime = int(time.mktime(self.prevYear.timetuple()))
			toTime = fromTime + 86400*365
			key={}
			key['date'] = {'$gte':fromTime,'$lt':toTime}
			for entry in self.db['monthly'].find(key):
				key = entry.copy()
				key.pop('counterByte',None)
				key.pop('counterPacket',None)
				key.pop('duration',None)
				key.pop('_id',None)
				key['date'] = fromTime
				exist = self.db['annually'].find_one(key)
				if exist is not None:
					key['_id'] = exist['_id']
					key['counterByte'] = entry['counterByte'] + exist['counterByte']
				else:
					key['counterByte'] = entry['counterByte']
				self.db['annually'].save(key)
			self.prevMonth = today

