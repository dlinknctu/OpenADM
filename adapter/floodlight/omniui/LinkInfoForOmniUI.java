
package net.floodlightcontroller.omniui;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import org.projectfloodlight.openflow.util.HexString;
import org.projectfloodlight.openflow.types.DatapathId;
import org.projectfloodlight.openflow.types.OFPort;

import net.floodlightcontroller.routing.Link;

@JsonSerialize(using=LinkInfoForOmniUI.class)
public class LinkInfoForOmniUI extends JsonSerializer<LinkInfoForOmniUI> {

	private DatapathId srcDpid;
	private DatapathId dstDpid;
	private OFPort srcPort;
	private OFPort dstPort;
    // Do NOT delete this, it's required for the serializer
    public LinkInfoForOmniUI() {}

	public LinkInfoForOmniUI(Link link) {
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
		jgen.writeNumberField("src-port", linkinfo.getSrcPort().getPortNumber());
		jgen.writeStringField("dst-switch", linkinfo.getDstDpidHexString());
		jgen.writeNumberField("dst-port", linkinfo.getDstPort().getPortNumber());
		jgen.writeEndObject();
    }

    @Override
    public Class<LinkInfoForOmniUI> handledType() {
        return LinkInfoForOmniUI.class;
    }

	//getter
	public DatapathId getSrcDpid() {
		return this.srcDpid;
	}
	public String getSrcDpidHexString() {
		return HexString.toHexString(this.srcDpid.getLong());
	}
	public DatapathId getDstDpid() {
		return this.dstDpid;
	}
	public String getDstDpidHexString() {
		return HexString.toHexString(this.dstDpid.getLong());
	}
	public OFPort getSrcPort() {
		return this.srcPort;
	}
	public OFPort getDstPort() {
		return this.dstPort;
	}
}
