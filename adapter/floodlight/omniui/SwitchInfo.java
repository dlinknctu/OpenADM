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

import org.openflow.protocol.statistics.*;

@JsonSerialize(using=SwitchInfo.class)
public class SwitchInfo extends JsonSerializer<SwitchInfo> {
	
	public String name;
	public Long dpid;
	public List< OFPortStatisticsReply > portList;
	public List< FlowTableInfo > flowtable;

    // Do NOT delete this, it's required for the serializer
    public SwitchInfo() {}
	
	public SwitchInfo(Long dpid){
		this.dpid=dpid;
	}


	//Port 
	private void setOFStatisticsPort(List<OFStatistics> portInfo){
		this.portList = new ArrayList<OFPortStatisticsReply>(portInfo.size());
		for(OFStatistics parent: portInfo){
			portList.add( ((OFPortStatisticsReply)parent));
		}
	}
	public void serializePort(JsonGenerator jgen){
		for(OFPortStatisticsReply port: portList){
			try{
				jgen.writeNumberField("PortNumber:",(int)((port.getPortNumber())&(0xffff)));
				jgen.writeNumberField("recvPackets",port.getreceivePackets());
				jgen.writeNumberField("transmitPackets",port.getTransmitPackets());
				jgen.writeNumberField("recvBytes",port.getReceiveBytes());
				jgen.writeNumberField("transmitBytes",port.getTransmitBytes());
			}
			catch (IOException e){

			}
		}
	}

	//Flow tables
	public void setOFStatisticsType(OFStatisticsType type,List<OFStatistics> infomation) {
		if(type == OFStatisticsType.PORT){
			setOFStatisticsPort(infomation);
		}

	}
			
	@Override
    public void serialize(SwitchInfo swi, JsonGenerator jgen, SerializerProvider arg2)
            throws IOException, JsonProcessingException {
        jgen.writeStartObject();
		jgen.writeNumberField("dpid :",swi.dpid);
        swi.serializePort(jgen);
		jgen.writeEndObject();
    }

    @Override
    public Class<SwitchInfo> handledType() {
        return SwitchInfo.class;
    }
}
