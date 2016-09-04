package org.winlab.omniui;

import org.apache.felix.scr.annotations.*;
import org.onosproject.core.ApplicationId;
import org.onosproject.core.CoreService;
import org.onosproject.net.link.LinkEvent;
import org.onosproject.net.link.LinkListener;
import org.onosproject.net.link.LinkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  This is class listen link event and post to OpenADM
 */
@Component(immediate = true)
public class LinkInfo {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    @Reference(cardinality = ReferenceCardinality.MANDATORY_UNARY)
    protected LinkService linkService;
    private LinkListener linkListener = new InternalLinkListener();
    private ApplicationId appId;

    @Reference(cardinality = ReferenceCardinality.MANDATORY_UNARY)
    protected CoreService coreService;
    @Activate
    protected void activate() {
        appId = coreService.registerApplication("org.winlab.omniui");
        linkService.addListener(linkListener);
        log.info("Started");
    }

    @Deactivate
    protected void deactivate() {
        linkService.removeListener(linkListener);
        log.info("Stopped");
    }

    private class InternalLinkListener implements LinkListener {
        @Override
        public void event(LinkEvent linkEvent) {
            LinkPost lp = new LinkPost(linkEvent);
            lp.start();
        }
        class LinkPost extends Thread {
            private LinkEvent linkEvent;
            public LinkPost(LinkEvent linkEvent) {
                this.linkEvent = linkEvent;
            }
            @Override
            public void run() {
                Link link = new Link();
                SendMsg send = new SendMsg();
                log.info(linkEvent.type().toString());
                link.newLink(linkEvent.subject().dst().deviceId().toString(), linkEvent.subject().dst().port().toString());
                link.newLink(linkEvent.subject().src().deviceId().toString(), linkEvent.subject().src().port().toString());
                switch (linkEvent.type()) {
                    case LINK_UPDATED:
                    case LINK_ADDED:
                        send.PostMsg(((Object) link), "addlink", "Link");
                        log.info("Post Success");
                        break;
                    case LINK_REMOVED:
                        send.PostMsg(((Object) link), "dellink","Link");
                        log.info("Post Success");
                        break;
                }
            }
        }
    }

}
