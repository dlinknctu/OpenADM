import httplib
import logging
import json
from threading import Thread
logger = logging.getLogger(__name__)

class ControllerAdapter:
    def __init__(self,core,parm):
        """ ControllerAdapter init"""
        self.controllerIP = "localhost"
        self.controllerPort = "8080"
        self.timerInterval = 5
        self.switches={} #{controllername: []}
        self.links={} #{controllername: []}
        self.inquiryHandler=[]
        self.controllerlist = {} #{controllername: {ip: "xx",port: "xx",interval: "xx"}}
        #load config
        for name in parm:
            tmp = {}
            if(name is "interval"):
                self.timerInterval = parm["interval"]
                continue
            if(parm[name].has_key("ip")):
                tmp["ip"] = parm[name]["ip"]
                self.switches[name]={}
                self.links[name]={}
            if(parm[name].has_key("port")):
                tmp["port"] = parm[name]["port"]
            self.controllerlist[name] = tmp
        print(self.controllerList())
        for name in self.controllerlist:
            logger.debug('Controller name =%s IP =%s  port = %s' % (name,self.controllerlist[name]["ip"],self.controllerlist[name]["port"]))
            logger.debug('timerInterval = %s' % (self.timerInterval))

        ###what is the feature of shareing timerInterval
        core.registerEvent("controlleradapter",self.periodicInquiry,self.timerInterval)
        core.registerIPC("inquiryController", self.inquiryController)
        core.registerIPC("controllerList", self.controllerList)
        core.registerIPC("controllerDetail", self.controllerDetail)

    def inquirySwitch(self, controller, port):
        try:
            conn = httplib.HTTPConnection(controller, int(port))
            conn.request("GET", "/wm/omniui/switch/json")
            response = conn.getresponse().read()
        except Exception, e:
            logger.error("connection error for inquiring switches: "+str(e))
            return
        finally:
            conn.close()
        try:
            data = json.loads(response)
            controllerName = self.getControllerName(controller)
            self.switches[controllerName]= []
            for switch in data:
                tmp = {}
                tmp['dpid'] = switch['dpid']
                tmp['flows'] = switch['flows']
                tmp['ports'] = switch['ports']
                self.switches[controllerName] = tmp
        except Exception, e:
            logger.error("json parse error for switch: "+str(e))
    def inquiryLink(self, controller, port):
        try:
            conn = httplib.HTTPConnection(controller, int(port))
            conn.request("GET", "/wm/omniui/link/json")
            response = conn.getresponse().read()
        except Exception, e:
            logger.error("connection error for inquiring links: "+str(e))
            return
        finally:
            conn.close()
        try:
            data = json.loads(response)
            controllerName = self.getControllerName(controller)
            self.links[controllerName] = []
            for link in data:
                tmp = {}
                tmp['source'] = link['src-switch']
                tmp['target'] = link['dst-switch']
                tmp['sourcePort'] = link['src-port']
                tmp['targetPort'] = link['dst-port']
                self.links[controllerName]=tmp
        except Exception, e:
            logger.error("json parse error for links: "+str(e))

    def inquiryController(self, controller, port):
        self.inquiryLink(controller, port)
        self.inquirySwitch(controller, port)
        controllerName = self.getControllerName(controller)
        result = {}
        result['nodes'] = self.switches[controllerName]
        result['links'] = self.links[controllerName]
        return json.dumps(result, separators=(',',':'))

    def periodicInquiry(self):
        result = {}
        for controller in self.controllerlist:
            ip = self.controllerlist[controller]["ip"]
            port = self.controllerlist[controller]["port"]
            result[controller] = self.inquiryController(ip, port)
        print(result)
        return json.dumps(result, separators=(',',':'))

    def controllerList(self):
        tmp = []
        for controller in self.controllerlist:
            tmp.append(controller)
        return tmp

    def controllerDetail(self,controllerName):
        return self.controllerlist[controllerName]

    def getControllerName(self, ip):
        for name in self.controllerlist:
            if self.controllerlist[name]["ip"] is ip:
                return name
        return None
