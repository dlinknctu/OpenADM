import json
import sys
import os
import time
import signal
import gevent
from gevent.wsgi import WSGIServer
from gevent.queue import Queue
from importlib import import_module
import logging
import threading
from threading import Thread
from flask import Flask, Response, request, abort, render_template
from flask_cors import *
from pkg_resources import Requirement, resource_filename
rootPath = resource_filename(Requirement.parse("omniui"),"")

app = Flask(__name__)
app.config['CORS_ORIGINS'] = ['*']
subscriptions = []
logger = logging.getLogger(__name__)

# define module state enum
def enum(**enums):
	return type('Enum', (), enums)
Status = enum(PENDING=0,ACTIVE=1)

class Module:
	def __init__(self, name, status, dependencies):
		self.name = name
		self.status = status
		self.dependencies = dependencies

class ServerSentEvent(object):

	def __init__(self, data):
		self.id = None
		self.event = data['event']
		self.data = data['data']
		self.desc_map = {
			self.id: 'id',
			self.event: 'event',
			self.data: 'data'
		}

	def encode(self):
		"""Encodes received data to valid SSE format

		SSE payload format:
			id: xxx\n
			event: xxx\n
			data: xxx\n\n

		Return string:
			'id: xxx\nevent: xxx\ndata: xxx\n\n'
		"""
		if not self.data:
			return ''
		lines = ['%s: %s' % (v, k)
				for k, v in self.desc_map.iteritems() if k]

		return '%s\n\n' % '\n'.join(lines)

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
		self.ipcHandlers = {}
		global restHandlers # Necessary for bottle to access restHandlers
		restHandlers = {}
		global sseHandlers
		sseHandlers = {}

	def start(self):
		#Load config file
		with open(os.path.join(rootPath, 'etc/config.json'),'r') as input:
			data = input.read()
		config = json.loads(data)
		#Default values
		logFile = '/tmp/omniui.log'
		logLevel = logging.ERROR
		restIP = 'localhost'
		restPort = 5567
		ControllerType = ''
		#Set Logger
		if config.has_key("LogFile"):
			logFile = config['LogFile']
		logging.basicConfig(filename = logFile, level = logLevel, format = '%(asctime)s - %(levelname)s: %(message)s')
		console = logging.StreamHandler()
		console.setLevel(logging.DEBUG)
		#Modulize the controller adapter
		if config.has_key("ControllerType"):
			ControllerType = str(config['ControllerType']) + "_modules"

		"""
		ControllerType must be named like this:
		nox , pox , floodlight , opendaylight , ryu , trema ...etc, and core.py will append "_modules"

		i.e. pox_modules , floodlight_modules ...etc
		"""

		#Loading module
		sys.modules['plugins'] = plugins = type(sys)('plugins')
		plugins.__path__ = []
		plugins.__path__.append (os.path.join(rootPath, 'src', ControllerType))

		loadedModules = {}
		def loadModule(moduleName):
			if config[moduleName].has_key('depend'):
				module = Module(name=moduleName,status=Status.PENDING,dependencies=config[moduleName]['depend'])
			else:
				module = Module(name=moduleName,status=Status.PENDING,dependencies=[])
			if module.name in loadedModules.keys():
				return
			loadedModules[module.name]=module
			for dependency in module.dependencies:
				print("{} PENDING!!!".format(module.name))
				if dependency in loadedModules.keys() and loadedModules[dependency].status == Status.PENDING:
					print(module.name, dependency)
					print("dependencies loops, exit")
					os.kill(os.getpid(),1)
				loadModule(dependency)
			instance = import_module('plugins.' + module.name.lower())
			if(config.has_key(module.name)):
				getattr(instance,module.name)(self,config[module.name])
			else:
				print("module not found: {}".format(module.name))
				os.kill(os.getpid(),1)
			print("loading {}......".format(module.name))
			module.status = Status.ACTIVE
		# get module list
		for module in config:
			if module != "LogFile" and module != "REST" and module != "ControllerType" : # get modules other than LogFile and REST
				loadModule(module)
		# Start REST service
		if config.has_key("REST"):
			restIP = config['REST']['ip']
			restPort = config['REST']['port']

			def notify(e, d, q=None):
				msg = {
					'event': e,
					'data': d
				}
                                if q is not None:
                                    q.put(msg)
                                else:
                                    for sub in subscriptions[:]:
                                            sub.put(msg)

			@app.route('/debug')
			@cross_origin()
			def debug():
				return 'Currently %d subscriptions' % len(subscriptions)

			# Receive data from SB
			@app.route('/publish/<event>', methods=['POST'])
			@cross_origin()
			def publish(event):
				if event in sseHandlers:

					#
					# Process data, push event
					#

					rs = sseHandlers[event](request.json)
					if rs is None:
						logger.warn('\'%s\' event has been ignored' % event)
						return 'OK'
					gevent.spawn(notify, event, rs)
				else:
					abort(404, 'No such event: \'/publish/%s\'' % event)

				return 'OK'

			# For clients to subscribe server-sent events
			@app.route('/subscribe')
			@cross_origin()
			def subscribe():
				def gen():
					q = Queue()
					subscriptions.append(q)
					for e in sseHandlers.keys():
						rs = sseHandlers[e]('debut')
						if rs is not None:
							gevent.spawn(notify, e, rs, q)
					try:
						while True:
							result = q.get()
							ev = ServerSentEvent(result)
							yield ev.encode()
					except GeneratorExit:
						subscriptions.remove(q)

				return Response(gen(), mimetype='text/event-stream')

			# handler for feature request
			@app.route('/feature')
			@cross_origin()
			def featureRequest():
				feature = {'ControllerType': str(config['ControllerType'])}
				return "omniui(%s);" % json.dumps(feature)

			# general top level rest handler
			@app.route('/<url>', methods=['GET', 'POST', 'OPTIONS', 'PUT'])
			@cross_origin()
			def topLevelRoute(url):
				if url in restHandlers:
					return restHandlers[url](request)
				else:
					abort(404, "Not found: '/%s'" % url)

			# general second level rest handler
			@app.route('/<prefix>/<suffix>', methods=['GET', 'POST', 'OPTIONS', 'PUT'])
			@cross_origin()
			def secondLevelRoute(prefix, suffix):
				url = prefix + '/' + suffix
				if url in restHandlers:
					return restHandlers[url](request)
				else:
					abort(404, "Not found: '/%s'" % url)

			app.debug = True
			server = WSGIServer((restIP, int(restPort)), app)
			server.serve_forever()

	#Register REST API
	def registerRestApi(self, requestName, handler):
		restHandlers[requestName] = handler

	# Register SSE
	def registerSSEHandler(self, sseName, handler):
		sseHandlers[sseName] = handler

	#Register Event
	def registerEventHandler(self,eventName,handler):
		self.eventHandlers.append(EventHandler(eventName,handler))

	def registerEvent(self,eventName,generator,interval):
		thread = Thread(target=self.iterate, args=(eventName,generator,interval))
		self.threads.append(thread)
		thread.start()

	def registerIPC(self, ipcname, handler):
		self.ipcHandlers[ipcname] = handler

	def invokeIPC(self, ipcname, *argument):
		if ipcname in self.ipcHandlers:
			return	self.ipcHandlers[ipcname](*argument)
		else:
			print "invokeIPC fail. %s not found" % ipcname
			return None

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
	coreInstance = Core()
	coreInstance.start()
	
if __name__ ==	"__main__":
	main()
