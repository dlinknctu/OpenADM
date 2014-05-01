package net.floodlightcontroller.omniui;

import java.io.IOException;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.openflow.util.HexString;
import org.openflow.protocol.OFMatch;
import org.openflow.protocol.action.*;
import org.openflow.protocol.statistics.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@JsonSerialize(using=SwitchInfo.class)
public class SwitchInfo extends JsonSerializer<SwitchInfo> {
	protected static Logger log = LoggerFactory.getLogger(SwitchInfo.class);
	public String name;
	public Long dpid;
	public List< OFPortStatisticsReply > portList;
	public List< OFFlowStatisticsReply > flowList;

    // Do NOT delete this, it's required for the serializer
    public SwitchInfo() {}
	
	public SwitchInfo(Long dpid){
		this.dpid=dpid;
	}

    private String intToIp(int i) {
        return ((i >> 24 ) & 0xFF) + "." +
               ((i >> 16 ) & 0xFF) + "." +
               ((i >>  8 ) & 0xFF) + "." +
               ( i        & 0xFF);
    }

	//Port 
	private void setOFStatisticsPort(List<OFStatistics> portInfo){
		this.portList = new ArrayList<OFPortStatisticsReply>(portInfo.size());
		for(OFStatistics ofs: portInfo){
			portList.add( ((OFPortStatisticsReply)ofs));
		}
	}
	public void serializePort(JsonGenerator jgen){
		if(portList != null){
			try{
				jgen.writeFieldName("ports");
				jgen.writeStartArray();
				for(OFPortStatisticsReply port: portList){
					jgen.writeStartObject();
					jgen.writeNumberField("PortNumber",(int)((port.getPortNumber())&(0xffff)));
					jgen.writeNumberField("recvPackets",port.getreceivePackets());
					jgen.writeNumberField("transmitPackets",port.getTransmitPackets());
					jgen.writeNumberField("recvBytes",port.getReceiveBytes());
					jgen.writeNumberField("transmitBytes",port.getTransmitBytes());
					jgen.writeEndObject();
				}
				jgen.writeEndArray();
			}
			catch (IOException e){
				log.error("serialize port error {}",e.toString());
			}
		}
	}

	//Flow tables
	private void setOFStatisticsFlow(List<OFStatistics> flowInfo){
		this.flowList = new ArrayList<OFFlowStatisticsReply>(flowInfo.size());
		for(OFStatistics ofs: flowInfo){
			flowList.add( ((OFFlowStatisticsReply)ofs));
		}
	}
	
	public void serializeFlow(JsonGenerator jgen){
		if(flowList != null){
			try{
				jgen.writeFieldName("flows");
				jgen.writeStartArray();
				for(OFFlowStatisticsReply flow: flowList){
					jgen.writeStartObject();
					OFMatch match = flow.getMatch();
					jgen.writeNumberField("ingressPort",(int)(match.getInputPort()&0xffff));
					jgen.writeStringField("srcMac",HexString.toHexString(match.getDataLayerSource()));
					jgen.writeStringField("dstMac",HexString.toHexString(match.getDataLayerDestination()));
			        jgen.writeStringField("dstIP", intToIp(match.getNetworkDestination()));
		  	      	jgen.writeNumberField("dstIPMask", match.getNetworkDestinationMaskLen());
			        jgen.writeNumberField("netProtocol", match.getNetworkProtocol());
			        jgen.writeStringField("srcIP", intToIp(match.getNetworkSource()));
			        jgen.writeNumberField("srcIPMask", match.getNetworkSourceMaskLen());
			        jgen.writeNumberField("dstPort", match.getTransportDestination());
			        jgen.writeNumberField("srcPort", match.getTransportSource());
					jgen.writeNumberField("vlan", match.getDataLayerVirtualLan());
			        jgen.writeNumberField("vlanP", match.getDataLayerVirtualLanPriorityCodePoint());
					jgen.writeNumberField("wildcards", match.getWildcards());
					jgen.writeNumberField("tosBits", match.getNetworkTypeOfService());
					jgen.writeNumberField("counterByte", flow.getByteCount());
					jgen.writeNumberField("counterPacket", flow.getPacketCount());
					jgen.writeNumberField("idleTimeout", (int)(flow.getIdleTimeout()&0xffff));
					jgen.writeNumberField("hardTimeout", (int)(flow.getHardTimeout()&0xffff));
					jgen.writeNumberField("priority", (int)(flow.getPriority()&0xffff));
					jgen.writeNumberField("duration", flow.getDurationSeconds());
					jgen.writeNumberField("dlType",match.getDataLayerType());
					serializeAction(jgen, flow.getActions());
					jgen.writeEndObject();
				}
				jgen.writeEndArray();
			}
			catch (IOException e){
				log.error("serialize flow error {}",e.toString());
			}
		}
	}
	//OFAction
	private void serializeAction(JsonGenerator jgen, List<OFAction> actionList){
		if(actionList!=null){
			try{
				jgen.writeFieldName("actions");
				jgen.writeStartArray();
				for(OFAction action: actionList){
					OFActionType type = action.getType();
					jgen.writeStartObject();
					if(type == OFActionType.SET_VLAN_ID){
						OFActionVirtualLanIdentifier vaction = (OFActionVirtualLanIdentifier) action;
						int vid = vaction.getVirtualLanIdentifier();
						jgen.writeStringField("type","SET_VLAN_ID");
						jgen.writeStringField("value",Integer.toString(vid));
						jgen.writeEndObject();
					}else if(type == OFActionType.SET_VLAN_PCP){
						OFActionVirtualLanPriorityCodePoint paction = (OFActionVirtualLanPriorityCodePoint) action;
						int pcp = paction.getVirtualLanPriorityCodePoint();
						jgen.writeStringField("type","SET_VLAN_P");
						jgen.writeStringField("value",Integer.toString(pcp));
						jgen.writeEndObject();
					}else if(type == OFActionType.STRIP_VLAN){
						jgen.writeStringField("type","STRIP_VLAN");
						jgen.writeEndObject();
					}else{
						String str = action.toString();
						//Foramt = type[value]
						int index1,index2;
						index1 = str.indexOf('[');
						index2 = str.lastIndexOf(']');
						jgen.writeStringField("type",str.substring(0,index1));
						jgen.writeStringField("value",str.substring(index1+1,index2));
						jgen.writeEndObject();
					}
				}

				jgen.writeEndArray();
			}
			catch (IOException e){
				log.error("serialize flow action error{}",e.toString());
			}
		}

	}
	public void setOFStatisticsType(OFStatisticsType type,List<OFStatistics> information) {
		if(type == OFStatisticsType.PORT){
			setOFStatisticsPort(information);
		}
		else if(type == OFStatisticsType.FLOW){
			setOFStatisticsFlow(information);
		}
	}
			
	@Override
    public void serialize(SwitchInfo swi, JsonGenerator jgen, SerializerProvider arg2)
            throws IOException, JsonProcessingException {
    	    jgen.writeStartObject();
			jgen.writeStringField("dpid",HexString.toHexString(swi.dpid));
			swi.serializeFlow(jgen);
			swi.serializePort(jgen);
			jgen.writeEndObject();
    }

    @Override
    public Class<SwitchInfo> handledType() {
        return SwitchInfo.class;
    }
}
