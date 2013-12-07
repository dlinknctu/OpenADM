import json
from controlleradapter import ControllerAdapter
from uipusher import UIPusher
import logging
logger = logging.getLogger(__name__)


def main():
	#Load config file
	with open('config.json','r') as input:
		data = input.read()
	config = json.loads(data)

	#Default values

	logFile = 'log.txt'
	logLevel = logging.ERROR
	restIP = 'localhost'
	restPort = '5566'
	webUIIP = 'localhost'
	webUIPort = '5567'
	controllerIP = 'localhost'
	controllerPort = '8080'
	controllerInterval = 5
	#Set Logger
	if config.has_key("LogFile"):
		logFile = config['LogFile']
	logging.basicConfig(filename = logFile, level = logLevel, format = '%(asctime)s - %(levelname)s: %(message)s') 
	#Get Core setting
	if config.has_key("Core"):
		if config["Core"].has_key("ip"):
			restIP = config["Core"]["ip"]
		if config["Core"].has_key("port"):
			restPort = config["Core"]["port"]
	logger.debug('restIP =%s  restPort = %s' % (restIP,restPort))
	#Get UI settingn
	if config.has_key("WebUI"):
		if config["WebUI"].has_key("ip"):
			webUIIP = config["WebUI"]["ip"]
		if config["WebUI"].has_key("port"):
			webUIPort = config["WebUI"]["port"]
	logger.debug('webUI IP =%s  webUI Port = %s' % (webUIIP,webUIPort))
	#Get Controller setting
	if config.has_key("Controller"):
		if config["Controller"].has_key("ip"):
			controllerIP = config["Controller"]["ip"]
		if config["Controller"].has_key("port"):
			controllerPort = config["Controller"]["port"]
		if config["Controller"].has_key("interval"):
			controllerInterval = config["Controller"]["interval"]
	logger.debug('controllerIP =%s  controllerPort = %s' % (controllerIP,controllerPort))

	#initial 
	controlleradapter = ControllerAdapter(controllerIP,controllerPort,controllerInterval)
	uipusher = UIPusher(webUIIP,webUIPort)
	
	#register event handler
	controlleradapter.register_Topology_Request(uipusher.controllerHandler)
	#event loop
	controlleradapter.periodicInquiry()
if __name__ ==  "__main__":
	main()
