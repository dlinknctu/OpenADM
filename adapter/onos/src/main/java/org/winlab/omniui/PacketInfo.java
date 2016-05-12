package org.winlab.omniui;

import org.apache.felix.scr.annotations.*;
import org.onlab.packet.*;
import org.onosproject.core.ApplicationId;
import org.onosproject.core.CoreService;
import org.onosproject.net.packet.PacketContext;
import org.onosproject.net.packet.PacketProcessor;
import org.onosproject.net.packet.PacketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  This is class listen packet event and post to OpenADM
 */
@Component(immediate = true)
public class PacketInfo {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    @Reference(cardinality = ReferenceCardinality.MANDATORY_UNARY)
    protected PacketService packetService;
    private ReactivePacketProcessor processor = new ReactivePacketProcessor();
    private ApplicationId appId;

    @Reference(cardinality = ReferenceCardinality.MANDATORY_UNARY)
    protected CoreService coreService;
    @Activate
    protected void activate() {
        appId = coreService.registerApplication("org.winlab.omniui");
        packetService.addProcessor(processor, PacketProcessor.OBSERVER_MAX);
        log.info("Started");
    }

    @Deactivate
    protected void deactivate() {
        packetService.removeProcessor(processor);
        log.info("Stopped");
    }

    private class ReactivePacketProcessor implements PacketProcessor {
        @Override
        public void process(PacketContext packetContext) {
            PacketPost packetPost = new PacketPost(packetContext);
            packetPost.start();
        }
        private class PacketPost extends Thread {
            private PacketContext packetContext;
            public PacketPost(PacketContext packetContext) {
                this.packetContext = packetContext;
            }
            @Override
            public void run() {
                Packet packet = new Packet();
                SendMsg sendMsg = new SendMsg();
                packet.setMac_dst(packetContext.inPacket().parsed().getDestinationMAC().toString());
                packet.setMac_src(packetContext.inPacket().parsed().getSourceMAC().toString());
                packet.setDpid(packetContext.inPacket().receivedFrom().deviceId().toString());
                packet.setIn_port(packetContext.inPacket().receivedFrom().port().toString());
                packet.setEther_type(String.valueOf(packetContext.inPacket().parsed().getEtherType()));
                IPacket iPacket = packetContext.inPacket().parsed().getPayload();
                if(packetContext.inPacket().parsed().getEtherType() == Ethernet.TYPE_LLDP) {
                    LLDP lldp = (LLDP)(iPacket);
                }
                else if (packetContext.inPacket().parsed().getEtherType() == Ethernet.TYPE_ARP) {
                    ARP arp = (ARP)(iPacket);
                    packet.setProtocol(String.valueOf(arp.getProtocolType()));
                }
                else if (packetContext.inPacket().parsed().getEtherType() == Ethernet.TYPE_BSN) {
                    LLDP lldp = (LLDP)(iPacket);
                }
                else if (packetContext.inPacket().parsed().getEtherType() == Ethernet.TYPE_IPV4) {
                    IPv4 iPv4 = (IPv4) (iPacket);
                    packet.setIp_src(String.valueOf(Ip4Address.valueOf(iPv4.getSourceAddress())));
                    packet.setIp_dst(String.valueOf(Ip4Address.valueOf(iPv4.getDestinationAddress())));
                    packet.setProtocol(String.valueOf(iPv4.getProtocol()));
                }
                else if(packetContext.inPacket().parsed().getEtherType() == Ethernet.TYPE_IPV6) {
                    IPv6 iPv6 = (IPv6)(iPacket);
                    packet.setIp_src(String.valueOf(Ip6Address.valueOf(iPv6.getSourceAddress())));
                    packet.setIp_dst(String.valueOf(Ip6Address.valueOf(iPv6.getDestinationAddress())));
                }
                sendMsg.PostMsg((Object)(packet), "packet", "Packet");
            }
        }
    }
}
