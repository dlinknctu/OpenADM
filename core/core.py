import json
import sys
import os
import time
import signal
from importlib import import_module
import logging
import threading
from threading import Thread
from bottle import route, run, abort, hook, request, response
logger = logging.getLogger(__name__)


class EventHandler:
	def __init__(self,eventName,handler):
		self.eventName = eventName
		self.handler = handler
	
class Core:
	def __init__(self):
		#Local members
		self.eventHandlers = []
		self.threads  = []
		self.events   = []
		global restHandlers # Necessary for bottle to access restHandlers
		restHandlers = {}
		#Load config file
		with open(os.path.join(sys.path[0],'config.json'),'r') as input:
			data = input.read()
		config = json.loads(data)
		#Default values
		logFile = 'log.txt'
		logLevel = logging.ERROR
		restIP = 'localhost'
		restPort = 5567
		#Set Logger
		if config.has_key("LogFile"):
			logFile = config['LogFile']
		logging.basicConfig(filename = logFile, level = logLevel, format = '%(asctime)s - %(levelname)s: %(message)s') 
		#Loading module
		sys.modules['plugins'] = plugins = type(sys)('plugins')
		plugins.__path__ = []
		plugins.__path__.append (os.path.join(sys.path[0],"modules"))
		for module in config:
			if module != "LogFile" and module != "REST": # load modules other than LogFile and REST
				instance = import_module('plugins.' + module.lower())
				if(config.has_key(module)):
					getattr(instance,module)(self,config[module])
				else:
					getattr(instance,module)(self,0)
		# Start REST service
		if config.has_key("REST"):
			restIP = config['REST']['ip']
			restPort = config['REST']['port']

			@hook('after_request')
			def enable_cors():
			    response.headers['Access-Control-Allow-Origin'] = 'http://localhost'

			@route('/info/:request', method='GET')
			def restRouter(request):
				if request in restHandlers:
					return restHandlers[request]()
				else:
					abort(404, "Not found: '/info/%s'" % request)

                        @route('/flowmod', method='POST')
                        def flowmodHandler():
                            if 'flowmod' in restHandlers:
                                data = json.load(request.body)
                                return restHandlers['flowmod'](data)
                            else:
                                abort(404, "Not found: '/flowmod'")
			run(host=restIP, port=restPort, quiet=True)


	#Register REST API
	def registerRestApi(self, requestName, handler):
		restHandlers[requestName] = handler

	#Register Event	
	def registerEventHandler(self,eventName,handler):
		self.eventHandlers.append(EventHandler(eventName,handler))
	
	def registerEvent(self,eventName,generator,interval):
		thread = Thread(target=self.iterate, args=(eventName,generator,interval))
		self.threads.append(thread)
		thread.start()

	def iterate(self,eventName,generator,interval):
		while True:
			event = generator()
			for handler in self.eventHandlers:
				if(handler.eventName == eventName):
					handler.handler(event)
			time.sleep(interval)

class Watcher:
	def __init__(self):
		self.child = os.fork()
		if self.child ==0 :
			return
		else:
			self.watch()
	def watch(self):
		try:
			os.wait()
		except KeyboardInterrupt:
			print "Ctrl-c received! Sending kill to threads..."
			self.kill()
		sys.exit()
	def kill(self):
		try:
			os.kill(self.child,signal.SIGKILL)
		except OSError: pass

def main():
	Watcher()
	Core()
if __name__ ==  "__main__":
	main()