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

//1219
import org.openflow.protocol.OFType;
import net.floodlightcontroller.core.IOFSwitch;
import net.floodlightcontroller.core.IFloodlightProviderService;
import org.openflow.util.U16;
import org.restlet.resource.ServerResource; //?
//

/**
 * Represents static flow entries to be maintained by the controller on the 
 * switches. 
 */
@LogMessageCategory("SwitchAddMethod")
public class SwitchAddMethod {
    protected static Logger log = LoggerFactory.getLogger(SwitchAddMethod.class);
	public static IFloodlightProviderService floodlightProvider;	//1219
	/*public static IFloodlightProviderService floodlightProvider =
                (IFloodlightProviderService)getContext().getAttributes().
                    get(IFloodlightProviderService.class.getCanonicalName());*/
	
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
                entry.put(SwitchAddResource.COLUMN_SWITCH, jp.getText());
            else if (n == "actions")
                entry.put(SwitchAddResource.COLUMN_ACTIONS, jp.getText());
            else if (n == "priority")
                entry.put(SwitchAddResource.COLUMN_PRIORITY, jp.getText());
            else if (n == "active")
                entry.put(SwitchAddResource.COLUMN_ACTIVE, jp.getText());
            else if (n == "wildcards")
                entry.put(SwitchAddResource.COLUMN_WILDCARD, jp.getText());
            else if (n == "ingress-port")
                entry.put(SwitchAddResource.COLUMN_IN_PORT, jp.getText());
            else if (n == "src-mac")
                entry.put(SwitchAddResource.COLUMN_DL_SRC, jp.getText());
            else if (n == "dst-mac")
                entry.put(SwitchAddResource.COLUMN_DL_DST, jp.getText());
            else if (n == "vlan-id")
                entry.put(SwitchAddResource.COLUMN_DL_VLAN, jp.getText());
            else if (n == "vlan-priority")
                entry.put(SwitchAddResource.COLUMN_DL_VLAN_PCP, jp.getText());
            else if (n == "ether-type")
                entry.put(SwitchAddResource.COLUMN_DL_TYPE, jp.getText());
            else if (n == "tos-bits")
                entry.put(SwitchAddResource.COLUMN_NW_TOS, jp.getText());
            else if (n == "protocol")
                entry.put(SwitchAddResource.COLUMN_NW_PROTO, jp.getText());
            else if (n == "src-ip")
                entry.put(SwitchAddResource.COLUMN_NW_SRC, jp.getText());
            else if (n == "dst-ip")
                entry.put(SwitchAddResource.COLUMN_NW_DST, jp.getText());
            else if (n == "src-port")
                entry.put(SwitchAddResource.COLUMN_TP_SRC, jp.getText());
            else if (n == "dst-port")
                entry.put(SwitchAddResource.COLUMN_TP_DST, jp.getText());
        }
        
        return entry;
    }
	
	//public static Map<String, Map<String, OFFlowMod>> parseRow(Map<String, Object> row, Map<String, Map<String, OFFlowMod>> entries) {
	public static void parseRow(Map<String, Object> row, Map<String, Map<String, OFFlowMod>> entries) {
        String switchName = null;

        StringBuffer matchString = new StringBuffer();

        OFFlowMod flowMod = (OFFlowMod) floodlightProvider.getOFMessageFactory()
                .getMessage(OFType.FLOW_MOD);

        if (!row.containsKey(SwitchAddResource.COLUMN_SWITCH)) {
            log.debug(
                    "skipping entry with missing required 'switch' entry: {}", row);
			return;
        }
        // most error checking done with ClassCastException
        try {
            // first, snag the required entries, for debugging info
            switchName = (String) row.get(SwitchAddResource.COLUMN_SWITCH);
           
            if (!entries.containsKey(switchName))
                entries.put(switchName, new HashMap<String, OFFlowMod>());
            initDefaultFlowMod(flowMod);	//1219

            for (String key : row.keySet()) {
                if (row.get(key) == null)
                    continue;
                if (key.equals(SwitchAddResource.COLUMN_SWITCH) || key.equals("id"))
                    continue; // already handled
                // explicitly ignore timeouts and wildcards
                if (key.equals(SwitchAddResource.COLUMN_HARD_TIMEOUT) || key.equals(SwitchAddResource.COLUMN_IDLE_TIMEOUT) ||
                        key.equals(SwitchAddResource.COLUMN_WILDCARD))
                    continue;
                if (key.equals(SwitchAddResource.COLUMN_ACTIVE)) {
                    if  (!Boolean.valueOf((String) row.get(SwitchAddResource.COLUMN_ACTIVE))) {
                        log.debug("skipping inactive entry for switch {}", switchName);
                        //entries.get(switchName).put(entryName, null);  // mark this an inactive
                        //break;	//1219
						return;
                    }
                } else if (key.equals(SwitchAddResource.COLUMN_ACTIONS)){
                    ActionParse.parseActionString(flowMod, (String) row.get(SwitchAddResource.COLUMN_ACTIONS), log);
					//continue;	//1219
                } else if (key.equals(SwitchAddResource.COLUMN_COOKIE)) {
                    flowMod.setCookie(
                            computeEntryCookie(flowMod,
                                    Integer.valueOf((String) row.get(SwitchAddResource.COLUMN_COOKIE))));
                } else if (key.equals(SwitchAddResource.COLUMN_PRIORITY)) {
                    flowMod.setPriority(U16.t(Integer.valueOf((String) row.get(SwitchAddResource.COLUMN_PRIORITY))));
                } else { // the rest of the keys are for OFMatch().fromString()
                    if (matchString.length() > 0)
                        matchString.append(",");
                    matchString.append(key + "=" + row.get(key).toString());
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

        OFMatch ofMatch = new OFMatch();
        String match = matchString.toString();
        try {
            ofMatch.fromString(match);
        } catch (IllegalArgumentException e) {
            log.debug(
                    "ignoring flow entry on switch {} with illegal OFMatch() key: "
                            + match, switchName);
            //return entries;	//1219
			return;
        }
        flowMod.setMatch(ofMatch);
		String entry_number = Integer.toString(entries.get(switchName).size());
        entries.get(switchName).put(entry_number, flowMod);
		
		//return entries;	//1219
    }

	public static void initDefaultFlowMod(OFFlowMod fm) {
        fm.setIdleTimeout((short) 0);   // infinite
        fm.setHardTimeout((short) 0);   // infinite
        fm.setBufferId(OFPacketOut.BUFFER_ID_NONE);
        fm.setCommand(OFFlowMod.OFPFC_MODIFY);
        fm.setFlags((short) 0);
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