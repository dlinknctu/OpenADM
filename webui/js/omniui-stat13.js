var array = [
	'<div><p>in_port</p><input type="text" class="in" style="width: 90%;"/></div>\
		<div><p>in_phy_port</p><input type="text" class="in" style="width: 90%;"/></div>',
	
	'<div><p>metadata</p><input type="text" class="metadata" style="width: 90%;"/></div>',
	
	'<div><p>eth_dst</p><input type="text" class="eth" style="width: 90%;"/></div>\
		<div><p>eth_dst_mask</p><input type="text" class="eth" style="width: 90%;"/></div>\
		<div><p>eth_src</p><input type="text" class="eth" style="width: 90%;"/></div>\
		<div><p>eth_src_mask</p><input type="text" class="eth" style="width: 90%;"/></div>\
		<div><p>eth_type</p><input type="text" class="eth" style="width: 90%;"/></div>',
	
	'<div><p>vlan_vid</p><input type="text" class="vlan" style="width: 90%;"/></div>\
		<div><p>vlan_vid_mask</p><input type="text" class="vlan" style="width: 90%;"/></div>\
		<div><p>vlan_pcp</p><input type="text" class="vlan" style="width: 90%;"/></div>',
		
	'<div><p>arp_op</p><input type="text" class="arp" style="width: 90%;"/></div>\
		<div><p>arp_spa</p><input type="text" class="arp" style="width: 90%;"/></div>\
		<div><p>arp_spa_mask</p><input type="text" class="arp" style="width: 90%;"/></div>\
		<div><p>arp_tpa</p><input type="text" class="arp" style="width: 90%;"/><div>\
		<div><p>arp_tpa_mask</p><input type="text" class="arp" style="width: 90%;"/></div>\
		<div><p>arp_sha</p><input type="text" class="arp" style="width: 90%;"/></div>\
		<div><p>arp_sha_mask</p><input type="text" class="arp" style="width: 90%;"/></div>\
		<div><p>arp_tha</p><input type="text" class="arp" style="width: 90%;"/></div>\
		<div><p>arp_tha_mask</p><input type="text" class="arp" style="width: 90%;"/></div>',
		
	'<div><p>ip_dscp</p><input type="text" class="ip" style="width: 90%;"/></div>\
		<div><p>ip_ecn</p><input type="text" class="ip" style="width: 90%;"/></div>\
		<div><p>ip_proto</p><input type="text" class="ip" style="width: 90%;"/></div>',
		
	'<div><p>ipv4_src</p><input type="text" class="ipv4" style="width: 90%;"/></div>\
		<div><p>ipv4_src_mask</p><input type="text" class="ipv4" style="width: 90%;"/></div>\
		<div><p>ipv4_dst</p><input type="text" class="ipv4" style="width: 90%;"/></div>\
		<div><p>ipv4_dst_mask</p><input type="text" class="ipv4" style="width: 90%;"/></div>',
		
	'<div><p>ipv6_src</p><input type="text" class="ipv6_1" style="width: 90%;"/></div>\
		<div><p>ipv6_src_mask</p><input type="text" class="ipv6_1" style="width: 90%;"/></div>\
		<div><p>ipv6_dst</p><input type="text" class="ipv6_1" style="width: 90%;"/></div>\
		<div><p>ipv6_dst_mask</p><input type="text" class="ipv6_1" style="width: 90%;"/></div>',
		
	'<div><p>ipv6_flable</p><input type="text" class="ipv6_2" style="width: 90%;"/></div>\
		<div><p>ipv6_flable_mask</p><input type="text" class="ipv6_2" style="width: 90%;"/></div>\
		<div><p>ipv6_nd_target</p><input type="text" class="ipv6_2" style="width: 90%;"/></div>\
		<div><p>ipv6_nd_sll</p><input type="text" class="ipv6_2" style="width: 90%;"/></div>\
		<div><p>ipv6_nd_tll</p><input type="text" class="ipv6_2" style="width: 90%;"/></div>\
		<div><p>ipv6_exthdr</p><input type="text" class="ipv6_2" style="width: 90%;"/></div>\
		<div><p>ipv6_exthdr_mask</p><input type="text" class="ipv6_2" style="width: 90%;"/></div>',
		
	'<div><p>tcp_src</p><input type="text" class="tcp/udp/sctp" style="width: 90%;"/></div>\
		<div><p>tcp_dst</p><input type="text" class="tcp/udp/sctp" style="width: 90%;"/></div>\
	<div><p>udp_src</p><input type="text" class="tcp/udp/sctp" style="width: 90%;"/></div>\
		<div><p>udp_dst</p><input type="text" class="tcp/udp/sctp" style="width: 90%;"/></div>\
	<div><p>sctp_src</p><input type="text" class="tcp/udp/sctp" style="width: 90%;"/></div>\
		<div><p>sctp_dst</p><input type="text" class="tcp/udp/sctp" style="width: 90%;"/></div>',
		
	'<div><p>icmpv4_type</p><input type="text" class="icmpv4/v6" style="width: 90%;"/></div>\
		<div><p>icmpv4_code</p><input type="text" class="icmpv4/v6" style="width: 90%;"/></div>\
	<div><p>icmpv6_type</p><input type="text" class="icmpv4/v6" style="width: 90%;"/></div>\
		<div><p>icmpv6_code</p><input type="text" class="icmpv4/v6" style="width: 90%;"/></div>',
		
	'<div><p>mpls_label</p><input type="text" class="mpls" style="width: 90%;"/></div>\
		<div><p>mpls_tc</p><input type="text" class="mpls" style="width: 90%;"/></div>\
		<div><p>mpls_bos</p><input type="text" class="mpls" style="width: 90%;"/></div>',
		
	'<div><p>pbb_isid</p><input type="text" class="pbb" style="width: 90%;"/></div>\
		<div><p>pbb_isid_mask</p><input type="text" class="pbb" style="width: 90%;"/></div>',
		
	'<div><p>tunnel_id</p><input type="text" class="tunnel" style="width: 90%;"/></div>\
		<div><p>tunnel_id_mask</p><input type="text" class="tunnel" style="width: 90%;"/></div>'
];
$().ready(function() {
	localStorage.clear();
	
	$('.statform button').each(function (index, element) {
		$this = $(element);
		$this.popover({
			hide: true,
			html: true,
			trigger: 'manual',
			content: function() {
				if(array[index]) return array[index];
			}
		});
	});
	var popolen;
	var current_button,old_button,init_button=$('#oldbtn');
	var click_count=0;
	$('.statform button').click(function(){			// show and hide popover
		if(click_count==0){
			current_button = $(this);
			old_button = init_button;
			current_button.popover('show');
			popolen = setTimeout(lll, 200);
			click_count=1;
		}else{
			if((old_button.attr('id')!=current_button.attr('id'))&&(current_button.attr('id')==$(this).attr('id'))){
				current_button.popover('hide');
				old_button = current_button;
			}else if((old_button.attr('id')==current_button.attr('id'))&&(current_button.attr('id')==$(this).attr('id'))){
				current_button.popover('show');
				old_button = init_button;
				popolen = setTimeout(lll, 200);
			}else{
				old_button = current_button;
				current_button = $(this);
				old_button.popover('hide');
				current_button.popover('show');
				popolen = setTimeout(lll, 200);
			}
		}
		// store value
		$(".popover-content input").keyup(function(){
			var value = $(this).val();
			var key = current_button.parent().parent().parent().parent().attr('class')+'@'+$(this).parent().find('p').text();
			localStorage[key] = value;
			//console.log(localStorage);
		});
	});
	// show the value
	function lll(){
		//console.log($(".popover-content").length);
		if($(".popover-content").length>0){
			for(key in localStorage){
				var table_n = key.split('@');
				var btn_n = current_button.text();
				if(table_n[0] == current_button.parent().parent().parent().parent().attr('class')){
					$(".popover-content").children().each(function(){
						if(btn_n==$(this).find('input').attr('class') && table_n[1]==$(this).find('p').text())
							$(this).find('input').val(localStorage[key]);
					});
				}
			}
		}
		clearTimeout(popolen);
	}
});

