package net.floodlightcontroller.omniui;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.Iterator;

import net.floodlightcontroller.util.MatchUtils;
import net.floodlightcontroller.util.ActionUtils;
import net.floodlightcontroller.core.web.StatsReply;
import net.floodlightcontroller.core.web.serializers.OFInstructionListSerializer;

import org.projectfloodlight.openflow.protocol.match.Match;
import org.projectfloodlight.openflow.protocol.match.MatchField;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import org.projectfloodlight.openflow.util.HexString;
import org.projectfloodlight.openflow.types.DatapathId;
import org.projectfloodlight.openflow.protocol.OFFlowStatsReply;
import org.projectfloodlight.openflow.protocol.OFFlowStatsEntry;
import org.projectfloodlight.openflow.protocol.OFPortStatsReply;
import org.projectfloodlight.openflow.protocol.OFPortStatsEntry;
import org.projectfloodlight.openflow.protocol.action.*;
import org.projectfloodlight.openflow.protocol.action.OFAction;
import org.projectfloodlight.openflow.protocol.action.OFAction.*;
import org.projectfloodlight.openflow.protocol.OFVersion;
import org.projectfloodlight.openflow.protocol.OFStatsType;
import org.projectfloodlight.openflow.protocol.OFStatsReply;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@JsonSerialize(using=SwitchInfo.class)
public class SwitchInfo extends JsonSerializer<SwitchInfo> {
    protected static Logger log = LoggerFactory.getLogger(SwitchInfo.class);
    protected String name;
    protected DatapathId dpid;
    protected List<OFPortStatsReply> portList;
    protected List<OFFlowStatsReply> flowList;

    // Do NOT delete this, it's required for the serializer
    public SwitchInfo() {}

    public SwitchInfo(DatapathId dpid) {
        this.dpid=dpid;
    }

    private String intToIp(int i) {
        return ((i >> 24 ) & 0xFF) + "." +
               ((i >> 16 ) & 0xFF) + "." +
               ((i >>  8 ) & 0xFF) + "." +
               (i & 0xFF);
    }

    //Port statistics
    private void setOFStatisticsPort(List<OFPortStatsReply> portInfo) {
        this.portList = new ArrayList<OFPortStatsReply>(portInfo.size());

        for(OFPortStatsReply ofps: portInfo) {
            portList.add(ofps);
        }
    }

    public void serializePort(JsonGenerator jGen) {
        if (portList != null) {
            try{
                jGen.writeFieldName("ports");
                jGen.writeStartArray();
                OFPortStatsReply portReply = portList.get(0); //we only fetch first element of PortStatsReply, which conditions do we have more than one OFPS

                for(OFPortStatsEntry entry : portReply.getEntries()) {
                    jGen.writeStartObject();

                    jGen.writeNumberField("PortNumber",entry.getPortNo().getPortNumber());
                    jGen.writeNumberField("recvPackets", entry.getRxPackets().getValue());
                    jGen.writeNumberField("transmitPackets", entry.getTxPackets().getValue());
                    jGen.writeNumberField("recvBytes", entry.getRxBytes().getValue());
                    jGen.writeNumberField("transmitBytes", entry.getTxBytes().getValue());
                    jGen.writeNumberField("recevDropped", entry.getRxDropped().getValue());
                    jGen.writeNumberField("transmitDropped", entry.getTxDropped().getValue());
                    jGen.writeNumberField("recevErrors", entry.getRxErrors().getValue());
                    jGen.writeNumberField("transmitErrors", entry.getTxErrors().getValue());
                    jGen.writeNumberField("recevFrameErrors", entry.getRxFrameErr().getValue());
                    jGen.writeNumberField("recevOverrunErrors", entry.getRxOverErr().getValue());
                    jGen.writeNumberField("recevCRCErrors", entry.getRxCrcErr().getValue());
                    jGen.writeNumberField("collisions", entry.getCollisions().getValue());

                    jGen.writeEndObject();
                }
                jGen.writeEndArray();
            }
            catch (IOException e) {
                log.error("serialize port error {}",e.toString());
            }
        }
    }

    //Flow tables
    private void setOFStatisticsFlow(List<OFFlowStatsReply> flowInfo) {
        this.flowList = new ArrayList<OFFlowStatsReply>(flowInfo.size());
        for(OFFlowStatsReply ofps: flowInfo) {
            flowList.add(ofps);
        }
    }

    public void serializeFlow(JsonGenerator jGen) {
        if (flowList != null) {
            try{
                jGen.writeFieldName("flows");
                jGen.writeStartArray();
                for (OFFlowStatsReply flowReply : flowList) {
                    List<OFFlowStatsEntry> entries = flowReply.getEntries();

                    for (OFFlowStatsEntry entry : entries) {
                        jGen.writeStartObject();

                        jGen.writeStringField("version", entry.getVersion().toString()); // return the enum name
                        jGen.writeNumberField("cookie", entry.getCookie().getValue());
                        jGen.writeStringField("tableId", entry.getTableId().toString());
                        jGen.writeNumberField("counterPacket", entry.getPacketCount().getValue());
                        jGen.writeNumberField("counterByte", entry.getByteCount().getValue());
                        jGen.writeNumberField("duration", entry.getDurationSec());
                        jGen.writeNumberField("priority", entry.getPriority());
                        jGen.writeNumberField("idleTimeout", entry.getIdleTimeout());
                        jGen.writeNumberField("hardTimeout", entry.getHardTimeout());

                        //FIXME We won't have the wildcards in OF 1.1+, should remove it when UI ready.
                        jGen.writeNumberField("wildcards", 0);
                        serializeMatch(jGen, entry.getMatch());

                        if (entry.getVersion() == OFVersion.OF_10) {
                            jGen.writeObjectFieldStart("actions");
                            serializeMatch(jGen, entry.getMatch());
                            jGen.writeEndObject();
                        } else {
                            OFInstructionListSerializer.serializeInstructionList(jGen, entry.getInstructions());
                        }

                        jGen.writeEndObject();
                    }
                }
                jGen.writeEndArray();
            }
            catch (IOException e) {
                log.error("serialize flow error {}",e.toString());
            }
        }
    }

    //OXM match
    private void serializeMatch(JsonGenerator jGen, Match match) throws IOException, JsonProcessingException {
        Iterator<MatchField<?>> mi = match.getMatchFields().iterator(); // get iter to any match field type
        Match m = match;

        while (mi.hasNext()) {
            MatchField<?> mf = mi.next();
            switch (mf.id) {
            case IN_PORT:
                jGen.writeStringField("ingressPort", m.get(MatchField.IN_PORT).toString());
    //            jGen.writeStringField(MatchUtils.STR_IN_PORT, m.get(MatchField.IN_PORT).toString());
                break;
            case IN_PHY_PORT:
                jGen.writeStringField(MatchUtils.STR_IN_PHYS_PORT, m.get(MatchField.IN_PHY_PORT).toString());
                break;
            case ARP_OP:
                jGen.writeNumberField(MatchUtils.STR_ARP_OPCODE, m.get(MatchField.ARP_OP).getOpcode());
                break;
            case ARP_SHA:
                jGen.writeStringField(MatchUtils.STR_ARP_SHA, m.get(MatchField.ARP_SHA).toString());
                break;
            case ARP_SPA:
                jGen.writeStringField(MatchUtils.STR_ARP_SPA, m.get(MatchField.ARP_SPA).toString());
                break;
            case ARP_THA:
                jGen.writeStringField(MatchUtils.STR_ARP_DHA, m.get(MatchField.ARP_THA).toString());
                break;
            case ARP_TPA:
                jGen.writeStringField(MatchUtils.STR_ARP_DPA, m.get(MatchField.ARP_TPA).toString());
                break;
            case ETH_TYPE:
                jGen.writeNumberField("dlType", m.get(MatchField.ETH_TYPE).getValue());
    //            jGen.writeNumberField(MatchUtils.STR_DL_TYPE, m.get(MatchField.ETH_TYPE).getValue());
                break;
            case ETH_SRC:
                jGen.writeStringField("srcMac", m.get(MatchField.ETH_SRC).toString());
    //            jGen.writeStringField(MatchUtils.STR_DL_SRC, m.get(MatchField.ETH_SRC).toString());
                break;
            case ETH_DST:
                jGen.writeStringField("dstMac", m.get(MatchField.ETH_DST).toString());
    //            jGen.writeStringField(MatchUtils.STR_DL_DST, m.get(MatchField.ETH_DST).toString());
                break;
            case VLAN_VID:
                jGen.writeNumberField("vlan", m.get(MatchField.VLAN_VID).getVlan());
    //            jGen.writeNumberField(MatchUtils.STR_DL_VLAN, m.get(MatchField.VLAN_VID).getVlan());
                break;
            case VLAN_PCP:
                jGen.writeNumberField("vlanP", m.get(MatchField.VLAN_PCP).getValue());
    //            jGen.writeNumberField(MatchUtils.STR_DL_VLAN_PCP, m.get(MatchField.VLAN_PCP).getValue());
                break;
            case ICMPV4_TYPE:
                jGen.writeNumberField(MatchUtils.STR_ICMP_TYPE, m.get(MatchField.ICMPV4_TYPE).getType());
                break;
            case ICMPV4_CODE:
                jGen.writeNumberField(MatchUtils.STR_ICMP_CODE, m.get(MatchField.ICMPV4_CODE).getCode());
                break;
            case ICMPV6_TYPE:
                jGen.writeNumberField(MatchUtils.STR_ICMPV6_TYPE, m.get(MatchField.ICMPV6_TYPE).getValue());
                break;
            case ICMPV6_CODE:
                jGen.writeNumberField(MatchUtils.STR_ICMPV6_CODE, m.get(MatchField.ICMPV6_CODE).getValue());
                break;
            case IP_DSCP:
                jGen.writeNumberField("tosBits", m.get(MatchField.IP_DSCP).getDscpValue());
    //            jGen.writeNumberField(MatchUtils.STR_NW_DSCP, m.get(MatchField.IP_DSCP).getDscpValue());
                break;
            case IP_ECN:
                jGen.writeNumberField(MatchUtils.STR_NW_ECN, m.get(MatchField.IP_ECN).getEcnValue());
                break;
            case IP_PROTO:
                jGen.writeNumberField("netProtocol", m.get(MatchField.IP_PROTO).getIpProtocolNumber());
    //            jGen.writeNumberField(MatchUtils.STR_NW_PROTO, m.get(MatchField.IP_PROTO).getIpProtocolNumber());
                break;
            case IPV4_SRC:
                jGen.writeStringField("srcIP", m.get(MatchField.IPV4_SRC).toString());
                if (m.get(MatchField.IPV4_SRC).isCidrMask()) {
                    jGen.writeStringField("srcIPMask", Integer.toString(m.get(MatchField.IPV4_SRC).asCidrMaskLength()));
                }
    //            jGen.writeStringField(MatchUtils.STR_NW_SRC, m.get(MatchField.IPV4_SRC).toString());
                break;
            case IPV4_DST:
                jGen.writeStringField("dstIP", m.get(MatchField.IPV4_DST).toString());
                if (m.get(MatchField.IPV4_DST).isCidrMask()) {
                    jGen.writeStringField("dstIPMask", Integer.toString(m.get(MatchField.IPV4_SRC).asCidrMaskLength()));
                }
    //            jGen.writeStringField(MatchUtils.STR_NW_DST, m.get(MatchField.IPV4_DST).toString());
                break;
            case IPV6_SRC:
                jGen.writeStringField(MatchUtils.STR_IPV6_SRC, m.get(MatchField.IPV6_SRC).toString());
                break;
            case IPV6_DST:
                jGen.writeStringField(MatchUtils.STR_IPV6_DST, m.get(MatchField.IPV6_DST).toString());
                break;
            case IPV6_FLABEL:
                jGen.writeNumberField(MatchUtils.STR_IPV6_FLOW_LABEL, m.get(MatchField.IPV6_FLABEL).getIPv6FlowLabelValue());
                break;
            case IPV6_ND_SLL:
                jGen.writeNumberField(MatchUtils.STR_IPV6_ND_SSL, m.get(MatchField.IPV6_ND_SLL).getLong());
                break;
            case IPV6_ND_TARGET:
                jGen.writeNumberField(MatchUtils.STR_IPV6_ND_TARGET, m.get(MatchField.IPV6_ND_TARGET).getZeroCompressStart());
                break;
            case IPV6_ND_TLL:
                jGen.writeNumberField(MatchUtils.STR_IPV6_ND_TTL, m.get(MatchField.IPV6_ND_TLL).getLong());
                break;
            case METADATA:
                jGen.writeNumberField(MatchUtils.STR_METADATA, m.get(MatchField.METADATA).getValue().getValue());
                break;
            case MPLS_LABEL:
                jGen.writeNumberField(MatchUtils.STR_MPLS_LABEL, m.get(MatchField.MPLS_LABEL).getValue());
                break;
            case MPLS_TC:
                jGen.writeNumberField(MatchUtils.STR_MPLS_TC, m.get(MatchField.MPLS_TC).getValue());
                break;
            case MPLS_BOS:
                jGen.writeStringField(MatchUtils.STR_MPLS_BOS, m.get(MatchField.MPLS_BOS).toString());
                break;
            case SCTP_SRC:
                jGen.writeNumberField(MatchUtils.STR_SCTP_SRC, m.get(MatchField.SCTP_SRC).getPort());
                break;
            case SCTP_DST:
                jGen.writeNumberField(MatchUtils.STR_SCTP_DST, m.get(MatchField.SCTP_DST).getPort());
                break;
            case TCP_SRC:
                jGen.writeNumberField("srcPort", m.get(MatchField.TCP_SRC).getPort());
    //            jGen.writeNumberField(MatchUtils.STR_TCP_SRC, m.get(MatchField.TCP_SRC).getPort());
                break;
            case TCP_DST:
                jGen.writeNumberField("dstPort", m.get(MatchField.TCP_DST).getPort());
    //            jGen.writeNumberField(MatchUtils.STR_TCP_DST, m.get(MatchField.TCP_DST).getPort());
                break;
            case UDP_SRC:
                jGen.writeNumberField("srcPort", m.get(MatchField.UDP_SRC).getPort());
    //            jGen.writeNumberField(MatchUtils.STR_UDP_SRC, m.get(MatchField.UDP_SRC).getPort());
                break;
            case UDP_DST:
                jGen.writeNumberField("dstPort", m.get(MatchField.UDP_DST).getPort());
    //            jGen.writeNumberField(MatchUtils.STR_UDP_DST, m.get(MatchField.UDP_DST).getPort());
                break;
            default:
                // either a BSN or unknown match type
                break;
            } // end switch of match type

        }
    }

    //FIXME we should provide the instruction for OF 1.1+
    //OFAction
    private void serializeActions(JsonGenerator jGen, List<OFAction> actionList) throws IOException, JsonProcessingException {

        if (null != actionList) {
            try{
                jGen.writeFieldName("actions");
                jGen.writeStartArray();

                for (OFAction a: actionList) {
                    jGen.writeStartObject();
                    switch (a.getType()) {
                        case OUTPUT:
                            jGen.writeStringField("type", "OUTPUT");
                            jGen.writeStringField("value", ((OFActionOutput)a).getPort().toString());
                            jGen.writeEndObject();
                            break;
                        case SET_VLAN_VID:
                            jGen.writeStringField("type", "SET_VLAN_ID");
                            jGen.writeNumberField("value", ((OFActionSetVlanVid)a).getVlanVid().getVlan());
                            jGen.writeEndObject();
                            break;
                        case SET_VLAN_PCP:
                            jGen.writeStringField("type", "SET_VLAN_PCP");
                            jGen.writeNumberField("value", ((OFActionSetVlanPcp)a).getVlanPcp().getValue());
                            jGen.writeEndObject();
                            break;
                        case SET_QUEUE:
                            jGen.writeStringField("type", "SET_QUEUE");
                            jGen.writeNumberField("value", ((OFActionSetQueue)a).getQueueId());
                            jGen.writeEndObject();
                            break;
                        case SET_DL_SRC:
                            jGen.writeStringField("type", "SET_DL_SRC");
                            jGen.writeStringField("value", ((OFActionSetDlSrc)a).getDlAddr().toString());
                            jGen.writeEndObject();
                            break;
                        case SET_DL_DST:
                            jGen.writeStringField("type", "SET_DL_DST");
                            jGen.writeStringField("value", ((OFActionSetDlDst)a).getDlAddr().toString());
                            jGen.writeEndObject();
                            break;
                        case SET_NW_SRC:
                            jGen.writeStringField("type", "SET_NW_SRC");
                            jGen.writeStringField("value", ((OFActionSetNwSrc)a).getNwAddr().toString());
                            jGen.writeEndObject();
                            break;
                        case SET_NW_DST:
                            jGen.writeStringField("type", "SET_NW_DST");
                            jGen.writeStringField("value", ((OFActionSetNwDst)a).getNwAddr().toString());
                            jGen.writeEndObject();
                            break;
                        case SET_NW_TOS:
                            jGen.writeStringField("type", "SET_NW_TOS");
                            jGen.writeNumberField("value", ((OFActionSetNwTos)a).getNwTos());
                            jGen.writeEndObject();
                            break;
                        case SET_TP_SRC:
                            jGen.writeStringField("type", "SET_TP_SRC");
                            jGen.writeNumberField("value", ((OFActionSetTpSrc)a).getTpPort().getPort());
                            jGen.writeEndObject();
                            break;
                        case SET_TP_DST:
                            jGen.writeStringField("type", "SET_TP_DST");
                            jGen.writeNumberField("value", ((OFActionSetTpDst)a).getTpPort().getPort());
                            jGen.writeEndObject();
                            break;
                        case STRIP_VLAN:
                            jGen.writeStringField("type","STRIP_VLAN");
                            jGen.writeEndObject();
                            break;
                        default:
                            jGen.writeEndObject();
                    }
                }

                jGen.writeEndArray();
            } catch (IOException e) {
                log.error("serialize flow action error{}",e.toString());
            }
        }
    }

    @SuppressWarnings("unchecked")
    public void setOFStatType(OFStatsType type, Object reply) {

        switch(type) {
            case PORT:
                setOFStatisticsPort((List<OFPortStatsReply>)reply);
                break;
            case FLOW:
                setOFStatisticsFlow((List<OFFlowStatsReply>)reply);
                break;
        }
    }

    @Override
    public void serialize(SwitchInfo swi, JsonGenerator jGen, SerializerProvider arg2)
            throws IOException, JsonProcessingException {

            jGen.writeStartObject();
            jGen.writeStringField("dpid",HexString.toHexString(swi.dpid.getLong()));
            swi.serializeFlow(jGen);
            swi.serializePort(jGen);
            jGen.writeEndObject();
    }

    @Override
    public Class<SwitchInfo> handledType() {
        return SwitchInfo.class;
    }
}
