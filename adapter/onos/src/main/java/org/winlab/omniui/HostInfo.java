package org.winlab.omniui;

import org.apache.felix.scr.annotations.*;
import org.onosproject.core.ApplicationId;
import org.onosproject.core.CoreService;
import org.onosproject.net.host.HostEvent;
import org.onosproject.net.host.HostListener;
import org.onosproject.net.host.HostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  This is class listen host event and post to OpenADM
 */
@Component(immediate = true)
public class HostInfo {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    @Reference(cardinality = ReferenceCardinality.MANDATORY_UNARY)
    protected HostService hostService;
    private HostListener hostListener = new InternalHostListener();
    private ApplicationId appId;
    @Reference(cardinality = ReferenceCardinality.MANDATORY_UNARY)
    protected CoreService coreService;
    @Activate
    protected void activate() {
        appId = coreService.registerApplication("org.winlab.omniui");
        hostService.addListener(hostListener);
        log.info("Started");
    }

    @Deactivate
    protected void deactivate() {
        hostService.removeListener(hostListener);
        log.info("Stopped");
    }

    private class InternalHostListener implements HostListener {
        @Override
        public void event(HostEvent hostEvent) {
            HostPost hostPost = new HostPost(hostEvent);
            hostPost.start();
        }
        private class HostPost extends Thread {
            private HostEvent hostEvent ;
            public HostPost(HostEvent hostEvent) {
                this.hostEvent = hostEvent;
            }
            @Override
            public void run() {
                Host host = new Host();
                SendMsg sendMsg = new SendMsg();
                host.setIp(hostEvent.subject().id().toString());
                host.setMac(hostEvent.subject().mac().toString());
                host.setVlan(hostEvent.subject().vlan().toString());
                host.addLocation(hostEvent.subject().location().deviceId().toString(),hostEvent.subject().location().port().toString());
                host.setType("wired");
                switch (hostEvent.type()) {
                    case HOST_ADDED:
                    case HOST_UPDATED:
                        sendMsg.PostMsg((Object)(host), "addhost", "Host");
                        break;
                    case HOST_REMOVED:
                        sendMsg.PostMsg((Object)(host), "delhost", "Host");
                        break;
                }
            }
        }
    }
}
