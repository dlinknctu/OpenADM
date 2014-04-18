function UpdateShowcase(json) {
    var oxm_match = JSON.parse(json);
    console.log(oxm_match);
}

function QueryUDSEntries() {
    $.ajax({
        type: "GET",
        url: "http://localhost:5567/uds/json",
        dataType: "jsonp",
        jsonpCallback: "uds",
        success: function(json) {
            UpdateShowcase(json);
            console.log(json);
        },
        error: function() {
            console.log("Fail to query UDS Entries.");
        }
    });
}

function UDSEntryMGMT(action, oxm_match) {
    $.ajax({
        type: "PUT",
        url: "http://localhost:5567/uds/" + action,
        data: oxm_match,
        success: function(resp) {
            console.log(resp);
        },
        error: function(resp) {
            console.log(resp);
        }
    });
}

function ParseInput() {
    var oxm_match = new Object();
    $("input").each(function() {
        if($(this).val() != "") {
            oxm_match[$(this).attr("id")] = $(this).val();
        }
    });
    console.log(oxm_match);
    return oxm_match;
}

$(document).ready(function() {
    $("#reload").click(function() {
        QueryUDSEntries();
    });
    $("#add-flow").click(function() {
        UDSEntryMGMT("add", ParseInput());
    });
    $("#del-flow").click(function() {
        UDSEntryMGMT("del", ParseInput());
    });
});
//oxm_match = {
//    in_port: uint32_t,
//    in_phy_port: uint32_t,
//    metadata: uint64_t,
//    eth_dst: uint8_t[6],
//    eth_dst_mask: uint8_t[6],
//    eth_src: uint8_t[6],
//    eth_src_mask: uint8_t[6],
//    eth_type: uint16_t,
//    vlan_vid: uint16_t,
//    vlan_vid_mask: uint16_t,
//    vlan_pcp: uint8_t,
//    ip_dscp: uint8_t,
//    ip_ecn: uint8_t,
//    ip_proto: uint8_t,
//    ipv4_src: uint32_t,
//    ipv4_src_mask: uint32_t,
//    ipv4_dst: uint32_t,
//    ipv4_dst_mask: uint32_t,
//    tcp_src: uint16_t,
//    tcp_dst: uint16_t,
//    udp_src: uint16_t,
//    udp_dst: uint16_t,
//    sctp_src: uint16_t,
//    sctp_dst: uint16_t,
//    icmpv4_type: uint8_t,
//    icmpv4_code: uint8_t,
//    arp_op: uint16_t,
//    arp_spa: uint32_t,
//    arp_spa_mask: uint32_t,
//    arp_tpa: uint32_t,
//    arp_tpa_mask: uint32_t,
//    arp_sha: uint8_t[6],
//    arp_sha_mask: uint8_t[6],
//    arp_tha: uint8_t[6],
//    arp_tha_mask: uint8_t[6],
//    ipv6_src: in6_addr,
//    ipv6_src_mask: in6_addr,
//    ipv6_dst: in6_addr,
//    ipv6_dst_mask: in6_addr,
//    ipv6_flabel: uint32_t,
//    ipv6_flabel_mask: uint32_t,
//    icmpv6_type: uint8_t,
//    icmpv6_code: uint8_t,
//    ipv6_nd_target: in6_addr,
//    ipv6_nd_sll: uint8_t[6],
//    ipv6_nd_tll: uint8_t[6],
//    mpls_label: uint32_t,
//    mpls_tc: uint8_t,
//    mpls_bos: uint8_t,
//    pbb_isid: uint32_t,
//    pbb_isid_mask: uint32_t,
//    tunnel_id: uint64_t,
//    tunnel_id_mask: uint64_t,
//    ipv6_exthdr: uint16_t,
//    ipv6_exthdr_mask: uint16_t
//}
