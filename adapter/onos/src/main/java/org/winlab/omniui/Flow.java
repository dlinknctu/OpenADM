package org.winlab.omniui;

import java.util.ArrayList;
import java.util.List;
import org.onosproject.net.flow.instructions.Instruction;
/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  Abstraction of flow
 */
public class Flow {
    private String controller = Omniui.controller_name;
    private String dpid = "";
    private List<Flows> flows = new ArrayList<Flows>();
    public void addFlow(String ingressPort, String dstMac, String srcMac, String dstIP, String dstIPMask,
                        String srcIP, String srcIPMask, String netProtocol, String dstPort, String srcPort,
                        String vlan, String vlanP, String wildcards, String tosBits, String counterByte,
                        String counterPacket, String idleTimeout, String hardTimeout, String priority,
                        String duration, String dlType,List<Action> action ) {
        flows.add(new Flows(ingressPort, dstMac, srcMac, dstIP, dstIPMask, srcIP, srcIPMask, netProtocol,
                dstPort, srcPort, vlan, vlanP, wildcards, tosBits, counterByte, counterPacket, idleTimeout,
                hardTimeout, priority, duration, dlType, action));
    }
    public void setDpid(String dpid) {this.dpid = dpid;}
    private class Flows {
        public String ingressPort = "";
        public String dstMac = "";
        public String srcMac = "";
        public String dstIP = "";
        public String dstIPMask = "";
        public String srcIP = "";
        public String srcIPMask = "";
        public String netProtocol = "";
        public String dstPort = "";
        public String srcPort = "";
        public String vlan = "";
        public String vlanP = "";
        public String wildcards = "";
        public String tosBits = "";
        public String counterByte = "";
        public String counterPacket = "";
        public String idleTimeout = "";
        public String hardTimeout = "";
        public String priority = "";
        public String duration = "";
        public String dlType = "";
        public List<Action> action = new ArrayList<Action>();
        
        public Flows( String ingressPort, String dstMac, String srcMac, String dstIP, String dstIPMask,
                     String srcIP, String srcIPMask, String netProtocol, String dstPort, String srcPort,
                     String vlan, String vlanP, String wildcards, String tosBits, String counterByte,
                     String counterPacket, String idleTimeout, String hardTimeout, String priority,
                     String duration, String dlType, List<Action> action){
            this.ingressPort = ingressPort;
            this.dstMac = dstMac;
            this.srcMac = srcMac;
            this.dstIP = dstIP;
            this.dstIPMask = dstIPMask;
            this.srcIP = srcIP;
            this.srcIPMask = srcIPMask;
            this.netProtocol = netProtocol;
            this.dstPort = dstPort;
            this.srcPort = srcPort;
            this.vlan = vlan;
            this.vlanP = vlanP;
            this.wildcards = wildcards;
            this.tosBits = tosBits;
            this.counterByte = counterByte;
            this.counterPacket = counterPacket;
            this.idleTimeout = idleTimeout;
            this.hardTimeout = hardTimeout;
            this.priority = priority;
            this.duration = duration;
            this.dlType = dlType;
            this.action = action;
        }
    }
}
