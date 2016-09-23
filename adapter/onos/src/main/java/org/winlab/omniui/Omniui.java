/*
 * Copyright 2014 Winlab, NCTU
 *  @author Ze-Yan Lin
 *  This Class handle flowmod from openadmUI  and set controller name
 */
package org.winlab.omniui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.onlab.packet.*;
import org.onosproject.core.DefaultGroupId;
import org.onosproject.core.GroupId;
import org.onosproject.net.DeviceId;
import org.onosproject.net.PortNumber;
import org.onosproject.net.flow.*;

import org.onosproject.rest.AbstractWebResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
@javax.ws.rs.Path("")
public class Omniui extends AbstractWebResource {
	private final Logger log = LoggerFactory.getLogger(this.getClass());
	public static String controller_name = "";
	final FlowRuleService service = get(FlowRuleService.class);
        public static String host = "";
        @javax.ws.rs.Path("/core")
        @POST
        @Produces("application/json")
        public Response setHost(InputStream in) {
            
            try {
                ObjectNode jsonTree = (ObjectNode) mapper().readTree(in);
                JsonNode coreJson = jsonTree.get("coreURL");
                JsonNode controllerJson = jsonTree.get("controllerName");
                if(coreJson != null && controllerJson != null ) {
                    host = coreJson.asText() + "/publish/";
                    controller_name = controllerJson.asText();
                    return Response.ok("OK").build();
                }
                return Response.ok("FAIL").build();
            } catch (Exception e) {
                log.error(e.toString());
                return Response.ok("FAIL").build();
            }
        }
	
	@javax.ws.rs.Path("/add/json")
	@POST
	@Produces("application/json")
	@Consumes("application/json")
	public Response flowmod(InputStream inputStream) {
		try {
			ObjectNode jsonTree = (ObjectNode) mapper().readTree(inputStream);
			log.info(jsonTree.toString());
			jsonTree.put("deviceId", jsonTree.get("dpid").toString());
			jsonTree.remove("dpid");
			jsonTree.remove("cookie");
			jsonTree.remove("cookie_mask");
			jsonTree.remove("table_id");
			jsonTree.remove("buffer_id");

			ObjectNode objectNode = (ObjectNode) mapper().createObjectNode();
			ArrayNode arrayNode = (ArrayNode) mapper().createArrayNode();
			ObjectNode action = (ObjectNode) mapper().createObjectNode();
			action.put("type",jsonTree.get("action").toString().split("=")[0]);
			action.put("value",jsonTree.get("action").toString().split("=")[1].split(",")[0]);
			arrayNode.add(action);
			objectNode.put("instructions",arrayNode);
			jsonTree.put("treatment", objectNode);
			jsonTree.remove("action");

			ObjectNode criteria = (ObjectNode) mapper().createObjectNode();
			FlowModEntry flowModEntry = new FlowModEntry(jsonTree.get("dpid").toString());
			TrafficSelector.Builder trafficBuilder = DefaultTrafficSelector.builder();
			if(jsonTree.has("dl_dst") || jsonTree.get("dl_dst").toString()=="x") { trafficBuilder.matchEthDst(MacAddress.valueOf(jsonTree.get("dl_dst").textValue())); }
			if(jsonTree.has("eth_type") || jsonTree.get("eth_type").toString()=="x") { trafficBuilder.matchEthType(Short.valueOf(jsonTree.get("eth_type").textValue())); }
			if(jsonTree.has("dl_src") || jsonTree.get("dl_src").toString()=="x") { trafficBuilder.matchEthSrc(MacAddress.valueOf(jsonTree.get("dl_src").textValue())); }
			if(jsonTree.has("icmpv4_code") || jsonTree.get("icmpv4_code").toString()=="x") { trafficBuilder.matchIcmpCode(Byte.valueOf(jsonTree.get("icmpv4_code").textValue())); }
			if(jsonTree.has("icmpv4_type") || jsonTree.get("icmpv4_type").toString()=="x") { trafficBuilder.matchIcmpType(Byte.valueOf(jsonTree.get("icmpv4_type").textValue())); }
			if(jsonTree.has("icmpv6_code") || jsonTree.get("icmpv6_code").toString()=="x") { trafficBuilder.matchIcmpv6Code(Byte.valueOf(jsonTree.get("icmpv6_code").textValue())); }
			if(jsonTree.has("icmpv6_type") || jsonTree.get("icmpv6_type").toString()=="x") { trafficBuilder.matchIcmpv6Type(Byte.valueOf(jsonTree.get("icmpv6_type").textValue())); }
			if(jsonTree.has("in_phy_port") || jsonTree.get("in_phy_port").toString()=="x") { trafficBuilder.matchInPhyPort(PortNumber.portNumber(jsonTree.get("in_phy_port").textValue())); }
			if(jsonTree.has("in_port") || jsonTree.get("in_port").toString()=="x") { trafficBuilder.matchInPort(PortNumber.portNumber(jsonTree.get("in_port").textValue())); }
			if(jsonTree.has("ip_dscp") || jsonTree.get("ip_dscp").toString()=="x") { trafficBuilder.matchIPDscp(Byte.valueOf(jsonTree.get("ip_dscp").textValue())); }
			if(jsonTree.has("ip_ecn") || jsonTree.get("ip_ecn").toString()=="x") { trafficBuilder.matchIPEcn(Byte.valueOf(jsonTree.get("ip_ecn").textValue())); }
			if(jsonTree.has("ip_proto") || jsonTree.get("ip_proto").toString()=="x") { trafficBuilder.matchIPProtocol(Byte.valueOf(jsonTree.get("ip_proto").textValue())); }
			if(jsonTree.has("ipv4_dst") || jsonTree.get("ipv4_dst").toString()=="x") { trafficBuilder.matchIPDst(IpPrefix.valueOf(jsonTree.get("ipv4_dst").textValue())); }
			if(jsonTree.has("ipv4_src") || jsonTree.get("ipv4_src").toString()=="x") { trafficBuilder.matchIPSrc(IpPrefix.valueOf(jsonTree.get("ipv4_src").textValue())); }
			if(jsonTree.has("ipv6_dst") || jsonTree.get("ipv6_dst").toString()=="x") { trafficBuilder.matchIPv6Dst(IpPrefix.valueOf(jsonTree.get("ipv6_dst").textValue())); }
			if(jsonTree.has("ipv6_src") || jsonTree.get("ipv6_src").toString()=="x") { trafficBuilder.matchIPv6Src(IpPrefix.valueOf(jsonTree.get("ipv6_src").textValue())); }
			if(jsonTree.has("ipv6_exthdr") || jsonTree.get("ipv6_exthdr").toString()=="x") { trafficBuilder.matchIPv6ExthdrFlags(Short.valueOf(jsonTree.get("ipv6_exthdr").textValue())); }
			if(jsonTree.has("ipv6_flabel") || jsonTree.get("ipv6_flabel").toString()=="x") { trafficBuilder.matchIPv6FlowLabel(Integer.parseInt(jsonTree.get("ipv6_flabel").textValue())); }
			if(jsonTree.has("ipv6_nd_sll") || jsonTree.get("ipv6_nd_sll").toString()=="x") { trafficBuilder.matchIPv6NDSourceLinkLayerAddress(MacAddress.valueOf(jsonTree.get("ipv6_nd_sll").textValue())); }
			if(jsonTree.has("ipv6_nd_target") || jsonTree.get("ipv6_nd_target").toString()=="x") { trafficBuilder.matchIPv6NDTargetAddress(Ip6Address.valueOf(jsonTree.get("ipv6_nd_target").textValue())); }
			if(jsonTree.has("ipv6_nd_tll") || jsonTree.get("ipv6_nd_tll").toString()=="x") { trafficBuilder.matchIPv6NDTargetLinkLayerAddress(MacAddress.valueOf(jsonTree.get("ipv6_nd_tll").textValue())); }
			if(jsonTree.has("metadata") || jsonTree.get("metadata").toString()=="x") { trafficBuilder.matchMetadata(Long.valueOf(jsonTree.get("metadata").textValue())); }
			if(jsonTree.has("mpls_bos") || jsonTree.get("mpls_bos").toString()=="x") { trafficBuilder.matchMplsBos(Boolean.valueOf(jsonTree.get("mpls_bos").textValue())); }
			if(jsonTree.has("mpls_label") || jsonTree.get("mpls_label").toString()=="x") { trafficBuilder.matchMplsLabel(MplsLabel.mplsLabel(jsonTree.get("mpls_label").intValue())); }
			if(jsonTree.has("sctp_dst") || jsonTree.get("sctp_dst").toString()=="x") { trafficBuilder.matchSctpDst(TpPort.tpPort(jsonTree.get("sctp_dst").intValue())); }
			if(jsonTree.has("sctp_src") || jsonTree.get("sctp_src").toString()=="x") { trafficBuilder.matchSctpSrc(TpPort.tpPort(jsonTree.get("sctp_src").intValue())); }
			if(jsonTree.has("tcp_dst") || jsonTree.get("tcp_dst").toString()=="x") { trafficBuilder.matchTcpDst(TpPort.tpPort(jsonTree.get("tcp_dst").intValue())); }
			if(jsonTree.has("tcp_src") || jsonTree.get("tcp_src").toString()=="x") { trafficBuilder.matchTcpSrc(TpPort.tpPort(jsonTree.get("tcp_src").intValue())); }
			if(jsonTree.has("tunnel_id") || jsonTree.get("tunnel_id").toString()=="x") { trafficBuilder.matchTunnelId(jsonTree.get("tunnel_id").asLong()); }
			if(jsonTree.has("udp_dst") || jsonTree.get("udp_dst").toString()=="x") { trafficBuilder.matchUdpDst(TpPort.tpPort(jsonTree.get("udp_dst").intValue())); }
			if(jsonTree.has("udp_src") || jsonTree.get("udp_src").toString()=="x") { trafficBuilder.matchUdpSrc(TpPort.tpPort(jsonTree.get("udp_src").intValue())); }
			if(jsonTree.has("vlan_vid") || jsonTree.get("vlan_vid").toString()=="x") { trafficBuilder.matchVlanId(VlanId.vlanId(jsonTree.get("vlan_vid").shortValue())); }
			if(jsonTree.has("vlanP") || jsonTree.get("vlanP").toString()=="x") { trafficBuilder.matchVlanPcp(Byte.valueOf(jsonTree.get("vlanP").textValue())); }
			TrafficSelector trafficSelector = trafficBuilder.build();
			flowModEntry.selector = trafficSelector;

			String actions[] = jsonTree.get("action").textValue().split(",");
			TrafficTreatment.Builder builder =	DefaultTrafficTreatment.builder();
			for (String act:actions ) {
				String acts[] = act.split("=");
				switch(acts[0]) {
					case "OUTPUT":
						builder.setOutput(PortNumber.portNumber(acts[1]));
						break;
					case "COPY_TTL_OUT":
						builder.copyTtlOut();
						break;
					case "COPY_TTL_IN":
						builder.copyTtlIn();
						break;
					case "DEC_MPLS_TTL":
						builder.decMplsTtl();
						break;
					case "POP_MPLS":
						builder.popMpls(new EthType(Short.valueOf(acts[1])));
						break;
					case "PUSH_VLAN":
						builder.pushVlan();
						break;
					case "POP_VLAN":
						builder.popVlan();
						break;
					case "PUSH_MPLS":
						builder.pushMpls();
						break;
					case "GROUP":
						builder.group(new DefaultGroupId(Integer.valueOf(acts[1])));
						break;
					case "DEC_NW_TTL":
						builder.decNwTtl();
						break;
				}
			}
			
			flowModEntry.treatment = builder.build();
			service.applyFlowRules(flowModEntry);
			return Response.ok("{\"status\":\"success\"}").build();
		} catch (IOException e) {
			e.printStackTrace();
			return Response.ok("{\"status\":\"error\",\"error\":\"" + e.toString() + "\"}").build();
		}
	}

	private class FlowModEntry implements FlowEntry {
		String deviceId;
		TrafficTreatment treatment;
		TrafficSelector selector;
		public FlowModEntry(String dpid) {
			deviceId = dpid;
		}

		@Override
		public FlowEntryState state() {
			return null;
		}

		@Override
		public long life() {
			return 0;
		}

		@Override
		public long packets() {
			return 0;
		}

		@Override
		public long bytes() {
			return 0;
		}

		@Override
		public long lastSeen() {
			return 0;
		}

		@Override
		public int errType() {
			return 0;
		}

		@Override
		public int errCode() {
			return 0;
		}

		@Override
		public FlowId id() {
			return null;
		}

		@Override
		public short appId() {
			return 0;
		}

		@Override
		public GroupId groupId() {
			return null;
		}

		@Override
		public int priority() {
			return 0;
		}

		@Override
		public DeviceId deviceId() {
			return null;
		}

		@Override
		public TrafficSelector selector() {
			return null;
		}

		@Override
		public TrafficTreatment treatment() {
			return null;
		}

		@Override
		public int timeout() {
			return 0;
		}

		@Override
		public boolean isPermanent() {
			return false;
		}

		@Override
		public int tableId() {
			return 0;
		}

		@Override
		public boolean exactMatch(FlowRule flowRule) {
			return false;
		}

		@Override
		public FlowRuleExtPayLoad payLoad() {
			return null;
		}
	}
}
