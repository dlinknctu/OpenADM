import json
import sys
import os
import time
import signal
import gevent
import urllib2
from gevent.queue import Queue
from importlib import import_module
import logging
import threading
from threading import Thread
from flask import Flask, request, abort
from flask_cors import *
from flask_socketio import SocketIO, emit, send, disconnect, join_room
from pkg_resources import Requirement, resource_filename
rootPath = resource_filename(Requirement.parse("omniui"),"")

app = Flask(__name__)
app.config['CORS_ORIGINS'] = ['*']
app.config['SECRET_KEY'] = 'omniui'
socketio = SocketIO(app, async_mode='gevent') #disconnect with timeout
#socketio = SocketIO(app) #disconnect with event (better implement), but will have bug
subscriptions = Queue()
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
		global urlHandlers # Necessary for bottle to access urlHandlers
		urlHandlers = {}
		global adapterHandlers
		adapterHandlers = {}
		self.count = 0

	def start(self):
		#Load config file
		with open(os.path.join(rootPath, 'etc/config.json'),'r') as input:
			data = input.read()
		config = json.loads(data)
		#Default values
		logFile = '/tmp/omniui.log'
		logLevel = logging.ERROR
		handleIP = 'localhost'
		handlePort = 5567
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
			if module != "LogFile" and module != "WEBSOCKET" and module != "ControllerType" : # get modules other than LogFile and WEBSOCKET
				loadModule(module)
		# Start WEBSOCKET service
		if config.has_key("WEBSOCKET"):
			handleIP = config['WEBSOCKET']['ip']
			handlePort = config['WEBSOCKET']['port']

			def notify(e, d):
				msg = {
					'event': e,
					'data': d
				}
				subscriptions.put(msg)

			def subscribe(): # broardcast subscriptions
				def gen():
					try:
						while True:
							result = subscriptions.get()
							yield result
					except StopIteration:
						print('get subscription error.')

				responses = gen()
				while responses is not None: # broadcast forever
					r = responses.next()
					socketio.emit( str(r.get('event', '')).upper(),
					               {'data': str(r.get('data', '')) },
							   namespace='/websocket',
							   room='ready')
	
			@socketio.on('connect', namespace='/websocket')
			def do_connect():
				sid = request.sid
				print('Client ' + request.remote_addr + '(sid:' + str(sid) + ') connected')
				self.count = self.count + 1
				# get the first subscription
				#for e in adapterHandlers.keys():
				#	rs = adapterHandlers[e]('debut')
				#	if rs is not None:
				#		gevent.spawn(notify, e, rs)

			@socketio.on('SUBSCRIBE', namespace='/websocket')
			def on_join(data):
				payload = {'status': 'OK'}
				for e in adapterHandlers.keys():
					rs = adapterHandlers[e]('debut')
					if rs is not None:
						payload.update(rs)
				join_room('ready')
				emit('ALL_DATA', {'data': json.dumps(payload)} )

			@socketio.on('disconnect', namespace='/websocket')
			def do_disconnect():
				sid = request.sid
				print('Client ' + request.remote_addr + '(sid:' + str(sid) + ') disconnected')
				self.count = self.count - 1
				if self.count < 0 :
					self.count = 0

			@socketio.on_error()
			def handle_error(e):
				print(str(e))

			@socketio.on('DEBUG', namespace='/websocket')
			def debug():
				emit('DEBUG_RESP', {'data' : 'Currently %d subscriptions' % self.count })

			# Receive data from SB
			@app.route('/publish/<event>', methods=['POST'])
			@cross_origin()
			def publish(event):
				if event in adapterHandlers:

					#
					# Process data, push event
					#

					rs = adapterHandlers[event](request.json)
					if rs is None:
						logger.warn('\'%s\' event has been ignored' % event)
						return 'OK'
					gevent.spawn(notify, event, rs)
				else:
					abort(404, 'No such event: \'/publish/%s\'' % event)

				return 'OK'

			# handler for feature request
			@socketio.on('FEATURE', namespace='/websocket')
			def featureRequest():
				feature = {'ControllerType': str(config['ControllerType'])}
				emit('FEATURE_RESP', {'data' : "omniui(%s);" % json.dumps(feature)} )

			@socketio.on('SETTING_CONTROLLER', namespace='/websocket')
			def settingControllerRequest(message):
				settings = message.get('data', None)
				if settings is None:
					message = 'Setting controller error.'
					payload = {'status': 'FAILED', 'message': message}
					emit('SETTING_CONTROLLER_RESP', {'data', json.dumps(payload)} )
					return

				controller_url = settings['controllerURL']
				core_url = settings['coreURL']
				controller_name = settings['controllerName']
				req_body = json.dumps({'coreURL': core_url, 'controllerName': controller_name})

				req = urllib2.Request(controller_url + '/wm/omniui/core')
				req.add_header('Content-Type', 'application/json')
				response = urllib2.urlopen(req, req_body)
				result = response.read()

				payload = {'status': 'OK', 'message': result}

				emit('SETTING_CONTROLLER_RESP', {'data' : json.dumps(payload)})

			# handler other websocket handlers
			@socketio.on('OTHER', namespace='/websocket')
			def topLevelRoute(message):
				data = message.get('data', None)
				url = data.get('url', None)
				req = data.get('request', None)
				result = handleRoute(url, rest=False, req=req)
				if result is None:
					emit(url + '_RESP', {'data' : "Websocket API not found: '%s'" % url })
				else:
					emit(url.upper() + '_RESP', {'data' : json.dumps(result)} )

			# general top level rest handler
			@app.route('/<url>', methods=['GET', 'POST', 'OPTIONS', 'PUT'])
			@cross_origin()
			def topLevelRoute(url):
				result = handleRoute(url)
				if result is None:
					abort(404, "RESTful API not found: '/%s'" % url)
				else:
					return result

			# general second level rest handler
			@app.route('/<prefix>/<suffix>', methods=['GET', 'POST', 'OPTIONS', 'PUT'])
			@cross_origin()
			def secondLevelRoute(prefix, suffix):
				url = prefix + '/' + suffix
				result = handleRoute(url)
				if result is None:
					abort(404, "RESTful API not found: '/%s'" % url)
				else:
					return result

			def handleRoute(url, rest=True, req=None):
				if url is None:
					return None
				if url in urlHandlers:
					if rest:
						return urlHandlers[url](request)
					else:
						return urlHandlers[url](req)
				else:
					return None

			gevent.spawn(subscribe) # routine for broadcast subscriptions
			gevent.sleep(0) # won't work if remove this line
			socketio.run(app, host=handleIP, port=int(handlePort), debug=False)

	#Register WEBSOCKET and RESTful API
	def registerURLApi(self, requestName, handler):
		urlHandlers[requestName] = handler

	# Register Adapter API
	def registerAdapterHandler(self, requestName, handler):
		adapterHandlers[requestName] = handler

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
