/*
 * Copyright 2014 Open Networking Laboratory
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.winlab.omniui;

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

/**
 * Topology viewer resource.
 */
@javax.ws.rs.Path("")
public class Omniui extends AbstractWebResource {
	private final Logger log = LoggerFactory.getLogger(this.getClass());
	public static String controller_name = "";
	final FlowRuleService service = get(FlowRuleService.class);
	@javax.ws.rs.Path("/controller/name")
	@POST
	@Produces("application/json")
	public Response controller_name(@PathParam("name") String name){
		controller_name = name;
		return Response.ok("OK").build();
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
			if(jsonTree.has("dl_dst")) { trafficBuilder.matchEthDst(MacAddress.valueOf(jsonTree.get("dl_dst").textValue())); }
			if(jsonTree.has("eth_type")) { trafficBuilder.matchEthType(Short.valueOf(jsonTree.get("eth_type").textValue())); }
			if(jsonTree.has("dl_src")) { trafficBuilder.matchEthSrc(MacAddress.valueOf(jsonTree.get("dl_src").textValue())); }
			if(jsonTree.has("icmpv4_code")) { trafficBuilder.matchIcmpCode(Byte.valueOf(jsonTree.get("icmpv4_code").textValue())); }
			if(jsonTree.has("icmpv4_type")) { trafficBuilder.matchIcmpType(Byte.valueOf(jsonTree.get("icmpv4_type").textValue())); }
			if(jsonTree.has("icmpv6_code")) { trafficBuilder.matchIcmpv6Code(Byte.valueOf(jsonTree.get("icmpv6_code").textValue())); }
			if(jsonTree.has("icmpv6_type")) { trafficBuilder.matchIcmpv6Type(Byte.valueOf(jsonTree.get("icmpv6_type").textValue())); }
			if(jsonTree.has("in_phy_port")) { trafficBuilder.matchInPhyPort(PortNumber.portNumber(jsonTree.get("in_phy_port").textValue())); }
			if(jsonTree.has("in_port")) { trafficBuilder.matchInPort(PortNumber.portNumber(jsonTree.get("in_port").textValue())); }
			if(jsonTree.has("ip_dscp")) { trafficBuilder.matchIPDscp(Byte.valueOf(jsonTree.get("ip_dscp").textValue())); }
			if(jsonTree.has("ip_ecn")) { trafficBuilder.matchIPEcn(Byte.valueOf(jsonTree.get("ip_ecn").textValue())); }
			if(jsonTree.has("ip_proto")) { trafficBuilder.matchIPProtocol(Byte.valueOf(jsonTree.get("ip_proto").textValue())); }
			if(jsonTree.has("ipv4_dst")) { trafficBuilder.matchIPDst(IpPrefix.valueOf(jsonTree.get("ipv4_dst").textValue())); }
			if(jsonTree.has("ipv4_src")) { trafficBuilder.matchIPSrc(IpPrefix.valueOf(jsonTree.get("ipv4_src").textValue())); }
			if(jsonTree.has("ipv6_dst")) { trafficBuilder.matchIPv6Dst(IpPrefix.valueOf(jsonTree.get("ipv6_dst").textValue())); }
			if(jsonTree.has("ipv6_src")) { trafficBuilder.matchIPv6Src(IpPrefix.valueOf(jsonTree.get("ipv6_src").textValue())); }
			if(jsonTree.has("ipv6_exthdr")) { trafficBuilder.matchIPv6ExthdrFlags(Short.valueOf(jsonTree.get("ipv6_exthdr").textValue())); }
			if(jsonTree.has("ipv6_flabel")) { trafficBuilder.matchIPv6FlowLabel(Integer.parseInt(jsonTree.get("ipv6_flabel").textValue())); }
			if(jsonTree.has("ipv6_nd_sll")) { trafficBuilder.matchIPv6NDSourceLinkLayerAddress(MacAddress.valueOf(jsonTree.get("ipv6_nd_sll").textValue())); }
			if(jsonTree.has("ipv6_nd_target")) { trafficBuilder.matchIPv6NDTargetAddress(Ip6Address.valueOf(jsonTree.get("ipv6_nd_target").textValue())); }
			if(jsonTree.has("ipv6_nd_tll")) { trafficBuilder.matchIPv6NDTargetLinkLayerAddress(MacAddress.valueOf(jsonTree.get("ipv6_nd_tll").textValue())); }
			if(jsonTree.has("metadata")) { trafficBuilder.matchMetadata(Long.valueOf(jsonTree.get("metadata").textValue())); }
			if(jsonTree.has("mpls_bos")) { trafficBuilder.matchMplsBos(Boolean.valueOf(jsonTree.get("mpls_bos").textValue())); }
			if(jsonTree.has("mpls_label")) { trafficBuilder.matchMplsLabel(MplsLabel.mplsLabel(jsonTree.get("mpls_label").intValue())); }
			if(jsonTree.has("sctp_dst")) { trafficBuilder.matchSctpDst(TpPort.tpPort(jsonTree.get("sctp_dst").intValue())); }
			if(jsonTree.has("sctp_src")) { trafficBuilder.matchSctpSrc(TpPort.tpPort(jsonTree.get("sctp_src").intValue())); }
			if(jsonTree.has("tcp_dst")) { trafficBuilder.matchTcpDst(TpPort.tpPort(jsonTree.get("tcp_dst").intValue())); }
			if(jsonTree.has("tcp_src")) { trafficBuilder.matchTcpSrc(TpPort.tpPort(jsonTree.get("tcp_src").intValue())); }
			if(jsonTree.has("tunnel_id")) { trafficBuilder.matchTunnelId(jsonTree.get("tunnel_id").asLong()); }
			if(jsonTree.has("udp_dst")) { trafficBuilder.matchUdpDst(TpPort.tpPort(jsonTree.get("udp_dst").intValue())); }
			if(jsonTree.has("udp_src")) { trafficBuilder.matchUdpSrc(TpPort.tpPort(jsonTree.get("udp_src").intValue())); }
			if(jsonTree.has("vlan_vid")) { trafficBuilder.matchVlanId(VlanId.vlanId(jsonTree.get("vlan_vid").shortValue())); }
			if(jsonTree.has("vlanP")) { trafficBuilder.matchVlanPcp(Byte.valueOf(jsonTree.get("vlanP").textValue())); }
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
