import logging
from core import Core
logger = logging.getLogger(__name__)


class UIPusher:
	def __init__(self,core,parm):		
		# register event handler
		core.registerEventHandler("controlleradapter", self.controllerHandler)
		# register rest api
		core.registerRestApi("topology", self.topologyHandler)

	def topologyHandler(self):
		# return JSONP format
		return "omniui(%s);" % self.event

	def controllerHandler(self,event):
		self.event = event