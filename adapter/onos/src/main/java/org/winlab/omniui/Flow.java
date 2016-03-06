package org.winlab.omniui;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by zylin on 2016/1/30.
 */
public class Flow {
    private String controller = Omniui.controller_name;
    private String dpid = "";
    private List<Flows> flows = new ArrayList<Flows>();
    public void addFlow(String ingressPort, String dstMac, String srcMac, String dstIP, String dstIPMask,
                        String srcIP, String srcIPMask, String netProtocol, String dstPort, String srcPort,
                        String vlan, String vlanP, String wildcards, String tosBits, String counterByte,
                        String counterPacket, String idleTimeout, String hardTimeout, String priority,
                        String duration, String dlType,String action_type, String action_value ) {
        flows.add(new Flows(ingressPort, dstMac, srcMac, dstIP, dstIPMask, srcIP, srcIPMask, netProtocol,
                dstPort, srcPort, vlan, vlanP, wildcards, tosBits, counterByte, counterPacket, idleTimeout,
                hardTimeout, priority, duration, dlType, action_type, action_value));
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
        public actions actions;
        private class actions {
            public String type = "";
            public String value = "";
            public actions (String type, String value) {
                this.type = type;
                this.value = value;
            }
        }
        public Flows( String ingressPort, String dstMac, String srcMac, String dstIP, String dstIPMask,
                     String srcIP, String srcIPMask, String netProtocol, String dstPort, String srcPort,
                     String vlan, String vlanP, String wildcards, String tosBits, String counterByte,
                     String counterPacket, String idleTimeout, String hardTimeout, String priority,
                     String duration, String dlType,String action_type, String action_value ){
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
            actions = new actions(action_type ,action_value);
        }
    }
}
