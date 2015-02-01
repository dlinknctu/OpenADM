package net.floodlightcontroller.omniui;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;


import net.floodlightcontroller.linkdiscovery.ILinkDiscoveryService;
import net.floodlightcontroller.linkdiscovery.ILinkDiscovery.LinkType;
import net.floodlightcontroller.linkdiscovery.LinkInfo;
import net.floodlightcontroller.routing.Link;


import org.projectfloodlight.openflow.types.DatapathId;
import org.projectfloodlight.openflow.types.OFPort;
import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;

public class LinkResource extends ServerResource {
    @Get("json")
    public List<LinkInfoForOmniUI> retrieve() {
		ILinkDiscoveryService ld = (ILinkDiscoveryService)getContext().getAttributes().get(ILinkDiscoveryService.class.getCanonicalName());
		Map<Link,LinkInfo> links = new HashMap<Link,LinkInfo>();
		List<LinkInfoForOmniUI> result = new ArrayList<LinkInfoForOmniUI>();

		if (null != links) {
			//copy the whole hash map
			links.putAll(ld.getLinks());
			for (Link link: links.keySet()) {
				DatapathId srcDpid = link.getSrc();
				DatapathId dstDpid = link.getDst();
				OFPort srcPort = link.getSrcPort();
				OFPort dstPort = link.getDstPort();

				//There are two link  entry of the bi-direction link in the links map,
				//So we should checkout this condtion for avoiding duplicate link.

				LinkInfo reverseInfo = links.get(new Link(dstDpid,dstPort,srcDpid,srcPort));

				if (null != reverseInfo) {
					if ((srcDpid.getLong() < dstDpid.getLong())) {
						result.add(new LinkInfoForOmniUI(link));
					}
				} else{
					result.add(new LinkInfoForOmniUI(link));
				}
			}
		}

        return result;
    }
}
