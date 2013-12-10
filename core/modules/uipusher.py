import logging
from core import Core
logger = logging.getLogger(__name__)


class UIPusher:
	def __init__(self,core,parm):
		core.registerEventHandler("controlleradapter",self.controllerHandler)
	def controllerHandler(self,event):
		print event

def getInstance(core,parm):
	return UIPusher(core,parm)
