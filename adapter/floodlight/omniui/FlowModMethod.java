package net.floodlightcontroller.omniui;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.ConcurrentHashMap;

import net.floodlightcontroller.core.annotations.LogMessageCategory;
import net.floodlightcontroller.core.annotations.LogMessageDoc;
import net.floodlightcontroller.core.util.AppCookie;
import net.floodlightcontroller.packet.IPv4;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.MappingJsonFactory;
import org.openflow.protocol.OFFlowMod;
import org.openflow.protocol.OFMatch;
import org.openflow.protocol.OFPacketOut;
import org.openflow.protocol.OFPort;
import org.openflow.protocol.action.OFAction;
import org.openflow.protocol.action.OFActionDataLayerDestination;
import org.openflow.protocol.action.OFActionDataLayerSource;
import org.openflow.protocol.action.OFActionEnqueue;
import org.openflow.protocol.action.OFActionNetworkLayerDestination;
import org.openflow.protocol.action.OFActionNetworkLayerSource;
import org.openflow.protocol.action.OFActionNetworkTypeOfService;
import org.openflow.protocol.action.OFActionOutput;
import org.openflow.protocol.action.OFActionStripVirtualLan;
import org.openflow.protocol.action.OFActionTransportLayerDestination;
import org.openflow.protocol.action.OFActionTransportLayerSource;
import org.openflow.protocol.action.OFActionVirtualLanIdentifier;
import org.openflow.protocol.action.OFActionVirtualLanPriorityCodePoint;
import org.openflow.util.HexString;

//
import org.openflow.protocol.OFType;
import net.floodlightcontroller.core.IOFSwitch;
import net.floodlightcontroller.core.IFloodlightProviderService;
import org.openflow.util.U16;
import org.restlet.resource.ServerResource; 
import org.openflow.protocol.Wildcards;
import org.openflow.protocol.Wildcards.Flag;
import java.util.EnumSet;
//

/**
 * Represents static flow entries to be maintained by the controller on the 
 * switches. 
 */
@LogMessageCategory("FlowModMethod")
public class FlowModMethod {
    protected static Logger log = LoggerFactory.getLogger(FlowModMethod.class);
	public static IFloodlightProviderService floodlightProvider;
	
	public static void setprovider(IFloodlightProviderService pro)
	{
		floodlightProvider = pro;
	}
	
	public static Map<String, Object> jsonToStorageEntry(String fmJson) throws IOException {
        Map<String, Object> entry = new HashMap<String, Object>();
        MappingJsonFactory f = new MappingJsonFactory();
        JsonParser jp;
        
        try {
            jp = f.createJsonParser(fmJson);
        } catch (JsonParseException e) {
            throw new IOException(e);
        }
        
        jp.nextToken();
        if (jp.getCurrentToken() != JsonToken.START_OBJECT) {
            throw new IOException("Expected START_OBJECT");
        }
        
        while (jp.nextToken() != JsonToken.END_OBJECT) {
            if (jp.getCurrentToken() != JsonToken.FIELD_NAME) {
                throw new IOException("Expected FIELD_NAME");
            }
            
            String n = jp.getCurrentName();
            jp.nextToken();
            if (jp.getText().equals("")) 
                continue;
            
            if (n == "switch")
                entry.put(FlowModResource.COLUMN_SWITCH, jp.getText());
            else if (n == "actions")
                entry.put(FlowModResource.COLUMN_ACTIONS, jp.getText());
            else if (n == "priority")
                entry.put(FlowModResource.COLUMN_PRIORITY, jp.getText());
            else if (n == "active")
                entry.put(FlowModResource.COLUMN_ACTIVE, jp.getText());
            else if (n == "wildcards")
                entry.put(FlowModResource.COLUMN_WILDCARD, jp.getText());
            else if (n == "ingressPort")
                entry.put(FlowModResource.COLUMN_IN_PORT, jp.getText());
            else if (n == "srcMac")
                entry.put(FlowModResource.COLUMN_DL_SRC, jp.getText());
            else if (n == "dstMac")
                entry.put(FlowModResource.COLUMN_DL_DST, jp.getText());
            else if (n == "vlan")
                entry.put(FlowModResource.COLUMN_DL_VLAN, jp.getText());
            else if (n == "vlanP")
                entry.put(FlowModResource.COLUMN_DL_VLAN_PCP, jp.getText());
            else if (n == "dlType")
                entry.put(FlowModResource.COLUMN_DL_TYPE, jp.getText());
            else if (n == "tosBits")
                entry.put(FlowModResource.COLUMN_NW_TOS, jp.getText());
            else if (n == "netProtocol")
                entry.put(FlowModResource.COLUMN_NW_PROTO, jp.getText());
            else if (n == "srcIP")
                entry.put(FlowModResource.COLUMN_NW_SRC, jp.getText());
            else if (n == "dstIP")
                entry.put(FlowModResource.COLUMN_NW_DST, jp.getText());
            else if (n == "srcPort")
                entry.put(FlowModResource.COLUMN_TP_SRC, jp.getText());
            else if (n == "dstPort")
                entry.put(FlowModResource.COLUMN_TP_DST, jp.getText());
			else if (n == "command")
				entry.put("of_command", jp.getText());
			else if (n == "idleTimeout")
				entry.put(FlowModResource.COLUMN_IDLE_TIMEOUT, jp.getText());
			else if (n == "hardTimeout")
				entry.put(FlowModResource.COLUMN_HARD_TIMEOUT, jp.getText());	
        }
        
        return entry;
    }
	
	public static void parseRow(Map<String, Object> row, Map<String, Map<String, OFFlowMod>> entries, Map<String, Map<String, OFFlowMod>> entries2) {
        String switchName = null;

        StringBuffer matchString = new StringBuffer();

        OFFlowMod flowMod = (OFFlowMod) floodlightProvider.getOFMessageFactory()
                .getMessage(OFType.FLOW_MOD);

        boolean haswild=false;

        if (!row.containsKey(FlowModResource.COLUMN_SWITCH)) {
            log.debug(
                    "skipping entry with missing required 'switch' entry: {}", row);
			return;
        }
        // most error checking done with ClassCastException
        try {
            // first, snag the required entries, for debugging info
            switchName = (String) row.get(FlowModResource.COLUMN_SWITCH);
           
            if (!entries.containsKey(switchName))
                entries.put(switchName, new HashMap<String, OFFlowMod>());
			if (!entries2.containsKey(switchName))
                entries2.put(switchName, new HashMap<String, OFFlowMod>());
            initDefaultFlowMod(flowMod);

            for (String key : row.keySet()) {
                if (row.get(key) == null)
                    continue;
                if (key.equals(FlowModResource.COLUMN_SWITCH) || key.equals("id"))
                    continue; // already handled
                // explicitly ignore timeouts and wildcards
                if (key.equals(FlowModResource.COLUMN_WILDCARD)){
                    haswild=true;
                    //Wildcards www = Wildcards.of(Integer.parseInt(row.get(FlowModResource.COLUMN_WILDCARD).toString()));
                    //EnumSet<Wildcards.Flag> enum1 = www.getWildcardedFlags();
				}else if(key.equals(FlowModResource.COLUMN_HARD_TIMEOUT)){
					flowMod.setHardTimeout(U16.t(Integer.valueOf((String) row.get(FlowModResource.COLUMN_HARD_TIMEOUT))));
				}else if(key.equals(FlowModResource.COLUMN_IDLE_TIMEOUT)){
					flowMod.setIdleTimeout(U16.t(Integer.valueOf((String) row.get(FlowModResource.COLUMN_IDLE_TIMEOUT))));
				}else if (key.equals(FlowModResource.COLUMN_ACTIVE)) {
                    if  (!Boolean.valueOf((String) row.get(FlowModResource.COLUMN_ACTIVE))) {
                        log.debug("skipping inactive entry for switch {}", switchName);
						return;
                    }
                } else if (key.equals(FlowModResource.COLUMN_ACTIONS)){
                    ActionParse.parseActionString(flowMod, (String) row.get(FlowModResource.COLUMN_ACTIONS), log);
                } else if (key.equals(FlowModResource.COLUMN_COOKIE)) {
                    flowMod.setCookie(
                            computeEntryCookie(flowMod,
                                    Integer.valueOf((String) row.get(FlowModResource.COLUMN_COOKIE))));
                } else if (key.equals(FlowModResource.COLUMN_PRIORITY)) {
                    flowMod.setPriority(U16.t(Integer.valueOf((String) row.get(FlowModResource.COLUMN_PRIORITY))));
				} else if(key.equals("of_command")) {
					String commandna = (String) row.get("of_command");
					if(commandna.equals("ADD"))
						flowMod.setCommand(OFFlowMod.OFPFC_ADD);
					else if(commandna.equals("DEL")){
						flowMod.setCommand(OFFlowMod.OFPFC_DELETE);
						FlowModResource.trydelete=true;
					}	
					else if(commandna.equals("MOD_ST"))
						flowMod.setCommand(OFFlowMod.OFPFC_MODIFY_STRICT);
					else if(commandna.equals("DEL_ST")){
						flowMod.setCommand(OFFlowMod.OFPFC_DELETE_STRICT);
						FlowModResource.trydelete=true;
					}
					else
						flowMod.setCommand(OFFlowMod.OFPFC_MODIFY);
						
                } else { // the rest of the keys are for OFMatch().fromString()
                    if(haswild){ 
                        Wildcards www = Wildcards.of(Integer.parseInt(row.get(FlowModResource.COLUMN_WILDCARD).toString())); 
                        if(!www.isWildcarded(Wildcards.Flag.valueOf(key.toString().toUpperCase()))){
                            if (matchString.length() > 0)
                                matchString.append(",");
                            matchString.append(key + "=" + row.get(key).toString());
                        }
                    }else{
                        if (matchString.length() > 0)
                            matchString.append(",");
                        matchString.append(key + "=" + row.get(key).toString());
                    }
                }
            }
        } catch (ClassCastException e) {
            if (switchName != null) {
                log.warn(
                        "Skipping switch {} with bad data : "
                                + e.getMessage(), switchName);
            } else {
                log.warn("Skipping entry with bad data: {} :: {} ",
                        e.getMessage(), e.getStackTrace());
            }
        }
        haswild=false;
        OFMatch ofMatch = new OFMatch();
        String match = matchString.toString();
        try {
            ofMatch.fromString(match);
        } catch (IllegalArgumentException e) {
            log.debug(
                    "ignoring flow entry on switch {} with illegal OFMatch() key: "
                            + match, switchName);
			return;
        }
        flowMod.setMatch(ofMatch);
		String entry_number = Integer.toString(entries.get(switchName).size());
        entries.get(switchName).put(entry_number, flowMod);
		String entry_number2 = Integer.toString(entries2.get(switchName).size());
        entries2.get(switchName).put(entry_number2, flowMod);
		
    }

	public static void initDefaultFlowMod(OFFlowMod fm) {
        fm.setIdleTimeout((short) 0);   // infinite
        fm.setHardTimeout((short) 0);   // infinite
        fm.setBufferId(OFPacketOut.BUFFER_ID_NONE);
        fm.setCommand(OFFlowMod.OFPFC_MODIFY);
        //fm.setFlags((short) 0);
        fm.setFlags(OFFlowMod.OFPFF_SEND_FLOW_REM);
		fm.setOutPort(OFPort.OFPP_NONE.getValue());
        fm.setCookie(computeEntryCookie(fm, 0));  
        fm.setPriority(Short.MAX_VALUE);
    }	
 
	public static long computeEntryCookie(OFFlowMod fm, int userCookie) {
        // flow-specific hash is next 20 bits LOOK! who knows if this 
        /*
        int prime = 211;
        int flowHash = 2311;
        for (int i=0; i < name.length(); i++)
            flowHash = flowHash * prime + (int)name.charAt(i);
        */
        // For now we use 0 so we can do a mass delete by cookie
        return AppCookie.makeCookie(10, 0);
    }
	
	public static void writeFlowModToSwitch(long dpid, OFFlowMod flowMod) {
        IOFSwitch ofSwitch = floodlightProvider.getSwitch(dpid);
        if (ofSwitch == null) {
            if (log.isDebugEnabled()) {
                log.debug("Not deleting key {} :: switch {} not connected",
                          dpid);
            }
            return;
        }
		//writeFlowModToSwitch(ofSwitch, flowMod);
		
        try {
            ofSwitch.write(flowMod, null);
            ofSwitch.flush();
        } catch (IOException e) {
            log.error("Tried to write OFFlowMod to {} but failed: {}",
                    HexString.toHexString(ofSwitch.getId()), e.getMessage());
        }
    }
}
