
package net.floodlightcontroller.omniui;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.openflow.util.HexString;


@JsonSerialize(using=SwitchInfo.class)
public class SwitchInfo extends JsonSerializer<SwitchInfo> {

    // Do NOT delete this, it's required for the serializer
    public SwitchInfo() {}

    @Override
    public void serialize(SwitchInfo lwt, JsonGenerator jgen, SerializerProvider arg2)
            throws IOException, JsonProcessingException {
        // You ****MUST*** use lwt for the fields as it's actually a different object.
        jgen.writeStartObject();
        jgen.writeEndObject();
    }

    @Override
    public Class<SwitchInfo> handledType() {
        return SwitchInfo.class;
    }
}
