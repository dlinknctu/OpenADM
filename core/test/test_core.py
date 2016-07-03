import sys
sys.path.append('src')
import unittest
import core

class CoreTestCase(unittest.TestCase):
    def handler(self):
        return

    def setUp(self):
        self.coreInstance = core.Core()

    def test_registerURLApi(self):
        self.coreInstance.registerURLApi('rest', self.handler)
        expected = self.handler
        result = core.urlHandlers['rest']
        self.assertEquals(expected, result)

    def test_registerAdapterHandler(self):
        self.coreInstance.registerAdapterHandler('sse', self.handler)
        expected = self.handler
        result = core.adapterHandlers['sse']
        self.assertEquals(expected, result)

    def test_registerEventHandler(self):
        self.coreInstance.registerEventHandler('event', self.handler)
        expected = self.handler
        result = None
        for handler in self.coreInstance.eventHandlers:
            if(handler.eventName == 'event'):
                result = handler.handler
        self.assertEquals(expected, result)

    def test_registerIPC(self):
        self.coreInstance.registerIPC('ipc', self.handler)
        expected = self.handler
        result = self.coreInstance.ipcHandlers['ipc']
        self.assertEquals(expected, result)

    def test_eventHandler(self):
        eventHandlerInstance = core.EventHandler('event', self.handler)
        self.assertEquals(eventHandlerInstance.eventName, 'event')
        self.assertEquals(eventHandlerInstance.handler, self.handler)

"""
    def registerEvent(self,eventName,generator,interval):
        thread = Thread(target=self.iterate, args=(eventName,generator,interval))
        self.threads.append(thread)
        thread.start()
"""

if __name__ == '__main__':
    unittest.main()
