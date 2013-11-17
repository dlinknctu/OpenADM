
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
	
	public long srcDpid;
	public long dstDpid;
	public short srcPort;
	public short dstPort;
    // Do NOT delete this, it's required for the serializer
    public LinkInfoForOmniUI() {}

	public LinkInfoForOmniUI(Link link){
		this.srcDpid = link.getSrc();
		this.dstDpid = link.getDst();
		this.srcPort = link.getSrcPort();
		this.dstPort = link.getDstPort();
	}
    @Override
    public void serialize(LinkInfoForOmniUI linktype, JsonGenerator jgen, SerializerProvider arg2)
            throws IOException, JsonProcessingException {
        // You ****MUST*** use lwt for the fields as it's actually a different object.
     
		jgen.writeStartObject();
        jgen.writeStringField("src-switch", HexString.toHexString(linktype.srcDpid));
		jgen.writeNumberField("src-port", linktype.srcPort);
		jgen.writeStringField("dst-switch", HexString.toHexString(linktype.dstDpid));
		jgen.writeNumberField("dst-port", linktype.dstPort);
		jgen.writeEndObject();
    }

    @Override
    public Class<LinkInfoForOmniUI> handledType() {
        return LinkInfoForOmniUI.class;
    }
}
