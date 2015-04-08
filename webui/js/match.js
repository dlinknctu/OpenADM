$("#match-dialog").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Go": function() {
                var item = {};
                var $label = $("#match-dialog fieldset label");
                var $input = $("#match-dialog fieldset input");
                $label.each(function(i, l) {
                    if($input.eq(i).val() != "") {
                        item[$(this).text()] = $input.eq(i).val();
                    }
                });
				console.log(item);
				getflowmsg(item);
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            $("#match-dialog fieldset input").each(function() {
                $(this).val("");
            });
        }
    });
    $("#match").click(function() {
        $("#match-dialog").dialog("open");
    });


function getflowmsg(f){
	var node1 = myGraph.findNode(f["switch"]);
	if(node1) 
	{
		var compare={};
		var flowss = myGraph.findNode(f["switch"]).flows;
			for(var j in flowss)
			{
				console.log(flowss[j]);
				startmatch(f,flowss[j],j,compare);
			}
			console.log(compare);
			var max_p=0;	//max priority
			for(var z in compare)
			{
				var y=parseInt(compare[z]);
				if(y>=max_p) max_p=y;
			}
			var max_p_s=max_p.toString();
			for(var z in compare)
			{
				if(compare[z]==max_p_s) nexthop(f,flowss[z]);
			}
	}else console.log("switch not exist");
}

function startmatch(f2,flow2,j2,compare2){
	if(flow2.srcMac!="00:00:00:00:00:00" && flow2.srcMac!="None")
	{
		if("srcMac" in f2)
		{
			console.log("HAVE SRCMAC");
			if(flow2.srcMac == f2["srcMac"]) console.log("match srcmac");
			else{ console.log("match srcmac failed"); return; }
		}else{
			console.log("NOT HAVE SRCMAC");
			return
		}
	}
	if(flow2.dstMac!="00:00:00:00:00:00" && flow2.dstMac!="None")
	{
		if("dstMac" in f2){
			console.log("HAVE DSTMAC");
			if(flow2.dstMac == f2["dstMac"]) console.log("match dstmac");
			else{ console.log("match dstmac failed"); return; }
		}else{
			console.log("NOT HAVE DSTMAC");
			return
		}
	}
    if(flow2.dlType!="0" && flow2.dlType!=null)
	{
		if("dlType" in f2){
			console.log("HAVE DLTYPE");
			if(flow2.dlType == f2["dlType"]) console.log("match dlType");
			else{ console.log("match dlType failed"); return; }
		}else{
			console.log("NOT HAVE DLTYPE");
			return;
		}
	}
	if(flow2.srcIP!="0.0.0.0" && flow2.srcIP!="None")
	{
		if("srcIP" in f2){
			console.log("HAVE SRCIP");
			if(flow2.srcIP == f2["srcIP"]) console.log("match srcIP");
			else{ console.log("match srcIP failed"); return; }
		}else{
			console.log("NOT HAVE SRCIP");
			return;
		}
	}
	if(flow2.dstIP!="0.0.0.0" && flow2.dstIP!="None")
	{
		if("dstIP" in f2){
			console.log("HAVE DSTIP");
			if(flow2.dstIP == f2["dstIP"]) console.log("match dstIP");
			else{ console.log("match dstIP failed"); return; }
		}else{
			console.log("NOT HAVE DSTIP");
			return;
		}
	}
	if(flow2.srcPort!="0")
	{
		if("srcPort" in f2){
			console.log("HAVE SRCPORT");
			if(flow2.srcPort == f2["srcPort"]) console.log("match srcPort");
			else{ console.log("match srcPort failed"); return; }
		}else{
			console.log("NOT HAVE SRCPORT");
			return;
		}
	}
	if(flow2.dstPort!="0")
	{
		if("dstPort" in f2){
			console.log("HAVE DSTPORT");
			if(flow2.dstPort == f2["dstPort"]) console.log("match dstPort");
			else{ console.log("match dstPort failed"); return; }
		}else{
			console.log("NOT HAVE DSTPORT");
			return;
		}
	}
	if(flow2.ingressPort!="0" && flow2.ingressPort!=null)
	{
		if("ingressPort" in f2){
			console.log("HAVE INGRESSPORT");
			if(flow2.ingressPort == f2["ingressPort"]) console.log("match ingressPort");
			else{ console.log("match ingressPort failed"); return; }
		}else{
			console.log("NOT HAVE INGRESSPORT");
			return;
		}
	}
	if(flow2.netProtocol!="0" && flow2.netProtocol!=null)
	{
		if("netProtocol" in f2){
			console.log("HAVE NETPROTOCOL");
			if(flow2.netProtocol == f2["netProtocol"]) console.log("match netProtocol");
			else{ console.log("match netProtocol failed"); return; }
			}else{
				console.log("NOT HAVE NETPROTOCOL");
				return;
			}
	}
	if(flow2.vlan!="0" && flow2.vlan!=null)
	{
		if("vlan" in f2){
			console.log("HAVE VLAN");
			if(flow2.vlan == f2["vlan"]) console.log("match vlan");
			else{ console.log("match vlan failed"); return; }
		}else{
			console.log("NOT HAVE VLAN");
			return;
		}
	}
	if(flow2.vlanP!="0")
	{
		if("vlanP" in f2){
			console.log("HAVE VLANP");
			if(flow2.vlanP == f2["vlanP"]) console.log("match vlanP");
			else{ console.log("match vlanP failed"); return; }
		}else{
			console.log("NOT HAVE VLANP");
			return;
		}
	}
	if(flow2.tosBits!="0")
	{
		if("tosBits" in f2){
			console.log("HAVE TOSBITS");
			if(flow2.tosBits == f2["tosBits"]) console.log("match tos-bits");
			else{ console.log("match tos-bits failed"); return; }
		}else{
			console.log("NOT HAVE TOSBITS");
			return;
		}
	}
	compare2[j2]=flow2.priority;
	//nexthop(f2,flow2);
}

function nexthop(ff3,flow3){
	var f3={};
	for(key in ff3) f3[key]=ff3[key];
	
	var node2 = $("circle.node");
	var length = node2.length;
	for(var k=0;k<length;k++)
	{
		var nodeid = node2[k].textContent;
		if(nodeid == f3["switch"])
		{
			node2[k].style.fill="#00cc00";
			
			for(act in flow3.actions)
			{
				if(flow3.actions[act].type!="OUTPUT")
				{
					//console.log(flow3.actions[act]);
					switch(flow3.actions[act].type){
						case "SET_TP_SRC":		//port
							f3["srcPort"]=flow3.actions[act].value;
							break;
						case "SET_TP_DST":
							f3["dstPort"]=flow3.actions[act].value;
							break;
						case "SET_NW_SRC":		//ip
							f3["srcIP"]=flow3.actions[act].value;
							break;
						case "SET_NW_DST":
							f3["dstIP"]=flow3.actions[act].value;
							break;
						case "SET_DL_SRC":		//mac
							f3["srcMac"]=flow3.actions[act].value.toLowerCase();
							break;
						case "SET_DL_DST":
							f3["dstMac"]=flow3.actions[act].value.toLowerCase();
							break;
						case "SET_NW_TOS":
							f3["tos-bits"]=flow3.actions[act].value;
							break;
						case "SET_VLAN_VID":
							f3["vlan"]=flow3.actions[act].value;
							break;
						case "SET_VLAN_PCP":
							f3["vlanP"]=flow3.actions[act].value;
							break;
						case "STRIP_VLAN":
							f3["vlan"]=null;
							break;
						case "ENQUEUE":
							break;
						default: 
							console.log("no support this actions");
							break;
					}
				}else{													//actions = output
					for(var i in myGraph.links)
					{
						//console.log(myGraph.links[i]);
						var src = myGraph.links[i].source.id;
						var dst = myGraph.links[i].target.id;
						var srcp = myGraph.links[i].sourcePort;
						var dstp = myGraph.links[i].targetPort;
						if(src==f3["switch"] && srcp==flow3.actions[act].value){
							var ff={};
							for(var key in f3)
							{
								if(key=="switch") ff[key]=dst;
								else if(key=="ingressPort") ff["ingressPort"]=dstp;
								else ff[key]=f3[key];
							}
							linkchangecolor(src,srcp,dst,dstp,true);
							getflowmsg(ff);
							break;
							
						}else if(dst==f3["switch"] && dstp==flow3.actions[act].value){
							var ff={};
							for(var key in f3)
							{
								if(key=="switch") ff[key]=src;
								else if(key=="ingressPort") ff["ingressPort"]=srcp;
								else ff[key]=f3[key];
							}
							linkchangecolor(src,srcp,dst,dstp,false);
							getflowmsg(ff);
							break;
						}else if(src==f3["switch"] && flow3.actions[act].value=="-5"){	//flood
							if(srcp==f3["ingressPort"]) continue;
							var ff={};
							for(var key in f3)
							{
								if(key=="switch") ff[key]=dst;
								else if(key=="ingressPort") ff["ingressPort"]=dstp;
								else ff[key]=f3[key];
							}
							linkchangecolor(src,srcp,dst,dstp,true);
							getflowmsg(ff);
							
						}else if(dst==f3["switch"] && flow3.actions[act].value=="-5"){	//flood
							if(dstp==f3["ingressPort"]) continue;
							var ff={};
							for(var key in f3)
							{
								if(key=="switch") ff[key]=src;
								else if(key=="ingressPort") ff["ingressPort"]=srcp;
								else ff[key]=f3[key];
							}
							linkchangecolor(src,srcp,dst,dstp,false);
							getflowmsg(ff);
						}else{
							console.log("no next hop");
						}
					}
				}
			}
			break;
		}
	}	
}

function linkchangecolor(src,srcp,dst,dstp,reverse){
	var link = $("path.link");
	var msg = "dpid " + src + ", port " + srcp + " -- " + "dpid " + dst + ", port " + dstp;
	var length = link.length;
	for(var k=0;k<length;k++)
	{
		if(link[k].textContent == msg)
		{
			var path = link[k];
			var totLen = path.getTotalLength();
			// Clear any previous transition
			path.style.animation = path.style.WebkitAnimation = 'none';

			// Setup dash style
			path.style.stroke = "#1199cc";
			path.style.strokeDasharray = 8;

			// Setup animation and insert into css
			$.keyframe.define([{
				name: 'forward_flow',
				'0%': {'stroke-dashoffset': 0},
				'100%': {'stroke-dashoffset': totLen*30}
			}]);
			$.keyframe.define([{
				name: 'reverse_flow',
				'0%': {'stroke-dashoffset': totLen*30},
				'100%': {'stroke-dashoffset': 0}
			}]);

			// Trigger a layout so styles are calculated & the browser
			// picks up the starting position before animating
			path.getBoundingClientRect();

			// Start animation
			if(reverse) {
				path.style.animation = path.style.WebkitAnimation = 'reverse_flow 30s linear infinite';
			}
			else {
				path.style.animation = path.style.WebkitAnimation = 'forward_flow 30s linear infinite';
			}
		}
	}
}

function clearcolor(){
	var link = $("path.link");
	var length = link.length;
	for(var k=0;k<length;k++) {
		link[k].style.stroke="#000";
		link[k].style.strokeDasharray = 0;
		link[k].style.animation = link[k].style.WebkitAnimation = 'none';
	}
	var node3 = $("circle.node");
	var length = node3.length;
	for(var k=0;k<length;k++) node3[k].style.fill="#FF9900";
}

function highlight(i){
	clearcolor();
	var hflow = {};
	for(var k in flows[i]) hflow[k]=flows[i][k];
    delete hflow["actions"];
	delete hflow["hardTimeout"];
	delete hflow["idleTimeout"];
	delete hflow["counterByte"];
    delete hflow["counterPacket"];
    delete hflow["srcIPMask"];
    delete hflow["dstIPMask"];
	delete hflow["wildcards"];
    hflow["switch"] = node.id;
    for(var k in hflow) {
        if(hflow[k]!=null) hflow[k] = hflow[k].toString();
    }
	getflowmsg(hflow);
}
