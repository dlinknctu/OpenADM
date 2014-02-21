
from core import Core
from pymongo import MongoClient
import datetime,time

class DbCollection:
	def __init__(self,core,parm):
		#	members
		self.timeInterval = 30  #one day
		self.prevDay  = datetime.datetime.today() 
		self.isconnect = False
		#	register event
		core.registerEvent("dbcollection",self.dbcollection,self.timeInterval)
		#	connect to db
		try:
			self.client = MongoClient(parm['dbip'],int(parm['dbport']))
			self.db = self.client[parm['db']]
			self.db.authenticate(parm['user'],parm['password'])
			self.isconnect = True
		except:
			print "database connection failed"
	def dbcollection(self):
		if self.isconnect:
			self.hourlyToDaily()

	def hourlyToDaily(self):
		today = datetime.datetime.today()
		tableName =	"hourly"+self.prevDay.strftime("%Y_%m_%d")
		print tableName
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

