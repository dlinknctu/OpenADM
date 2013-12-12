import logging
from core import Core
logger = logging.getLogger(__name__)


class UIPusher:
	def __init__(self,core,parm):
		core.registerEventHandler("controlleradapter",self.controllerHandler)
		core.registerRestApi("topology", self.topologyHandler)

	def topologyHandler(self):
		return

	def controllerHandler(self,event):
		return
