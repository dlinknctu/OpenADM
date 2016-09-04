package org.winlab.omniui;

import org.apache.felix.scr.annotations.*;
import org.onosproject.core.ApplicationId;
import org.onosproject.core.CoreService;
import org.onosproject.net.device.DeviceEvent;
import org.onosproject.net.device.DeviceListener;
import org.onosproject.net.device.DeviceService;
import org.onosproject.net.link.LinkListener;
import org.onosproject.net.link.LinkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  This is class listen device event and post to OpenADM
 */
@Component(immediate = true)
public class DeviceInfo {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    @Reference(cardinality = ReferenceCardinality.MANDATORY_UNARY)
    protected DeviceService deviceService;
    private DeviceListener deviceListener = new InternalDeviceListener();
    private ApplicationId appId;
    @Reference(cardinality = ReferenceCardinality.MANDATORY_UNARY)
    protected CoreService coreService;

    @Activate
    protected void activate() {
        appId = coreService.registerApplication("org.winlab.omniui");
        deviceService.addListener(deviceListener);
        log.info("Started Device listener");
    }
    @Deactivate
    protected void deactivate() {
        deviceService.removeListener(deviceListener);
        log.info("Stopped Device listener");
    }
    private class InternalDeviceListener implements DeviceListener {
        @Override
        public void event(DeviceEvent deviceEvent) {
            DevicePost devicePost = new DevicePost(deviceEvent);
            devicePost.start();
        }
        private class DevicePost extends Thread {
            private DeviceEvent deviceEvent;
            public DevicePost (DeviceEvent deviceEvent) {
                this.deviceEvent = deviceEvent;
            }
            @Override
            public void run() {
                Device device;
                SendMsg sendMsg = new SendMsg();
                Port port;
                switch (deviceEvent.subject().type()) {
                    case SWITCH:
                        switch (deviceEvent.type()) {
                            case DEVICE_ADDED:
                            case DEVICE_UPDATED:
                                device = new Device();
                                device.setDpid(deviceEvent.subject().id().toString());
                                sendMsg.PostMsg((Object)(device), "adddevice", "Device");
                                break;
			                case DEVICE_AVAILABILITY_CHANGED:
			                	if(deviceService.isAvailable(deviceEvent.subject().id())){
			                		device = new Device();
			                		device.setDpid(deviceEvent.subject().id().toString());	
			                		sendMsg.PostMsg((Object)(device), "adddevice", "Device");
			                	} else{
			                		device = new Device();
                                    device.setDpid(deviceEvent.subject().id().toString());
                                    sendMsg.PostMsg((Object)(device), "deldevice", "Device");
			                	}
			                	break;
                            case DEVICE_REMOVED:
                                device = new Device();
                                device.setDpid(deviceEvent.subject().id().toString());
                                sendMsg.PostMsg((Object)(device), "deldevice", "Device");
                                break;
                            case PORT_ADDED:
                            case PORT_UPDATED:
                                port = new Port();
                                port.setPort(deviceEvent.port().number().toString());
                                port.setDpid(deviceEvent.subject().id().toString());
                                sendMsg.PostMsg((Object)(port), "addport", "Port");
                                break;
                            case PORT_REMOVED:
                                port = new Port();
                                port.setPort(deviceEvent.port().number().toString());
                                port.setDpid(deviceEvent.subject().id().toString());
                                sendMsg.PostMsg((Object)(port), "delport", "Port");
                                break;
                        }
                        break;
                }
            }
        }
    }
}
