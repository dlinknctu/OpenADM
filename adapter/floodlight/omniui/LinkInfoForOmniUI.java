
package net.floodlightcontroller.omniui;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.openflow.util.HexString;

import net.floodlightcontroller.routing.Link;


@JsonSerialize(using=LinkInfoForOmniUI.class)
public class LinkInfoForOmniUI extends JsonSerializer<LinkInfoForOmniUI> {
	
	private long srcDpid;
	private long dstDpid;
	private short srcPort;
	private short dstPort;
    // Do NOT delete this, it's required for the serializer
    public LinkInfoForOmniUI() {}

	public LinkInfoForOmniUI(Link link){
		this.srcDpid = link.getSrc();
		this.dstDpid = link.getDst();
		this.srcPort = link.getSrcPort();
		this.dstPort = link.getDstPort();
	}
    @Override
    public void serialize(LinkInfoForOmniUI linkinfo, JsonGenerator jgen, SerializerProvider arg2)
            throws IOException, JsonProcessingException {
        // You ****MUST*** use lwt for the fields as it's actually a different object.
     
		jgen.writeStartObject();
        jgen.writeStringField("src-switch", linkinfo.getSrcDpidHexString());
		jgen.writeNumberField("src-port", linkinfo.getSrcPort());
		jgen.writeStringField("dst-switch", linkinfo.getDstDpidHexString());
		jgen.writeNumberField("dst-port", linkinfo.getDstPort());
		jgen.writeEndObject();
    }

    @Override
    public Class<LinkInfoForOmniUI> handledType() {
        return LinkInfoForOmniUI.class;
    }

	//getter
	public long getSrcDpid(){
		return this.srcDpid;
	}
	public String getSrcDpidHexString(){
		return HexString.toHexString(this.srcDpid);
	}
	public long getDstDpid(){
		return this.dstDpid;
	}
	public String getDstDpidHexString(){
		return HexString.toHexString(this.dstDpid);
	}
	public long getSrcPort(){
		return this.srcPort;
	}
	public long getDstPort(){
		return this.dstPort;
	}
}
