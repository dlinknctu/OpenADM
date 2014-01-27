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
				//console.log(item);
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
	var node = myGraph.findNode(f["switch"]);
	if(node) 
	{
		var flows = myGraph.findNode(f["switch"]).flows;
		//console.log("get successful");
			for(var j in flows)
			{
				//console.log(flows[j]);
				startmatch(f,flows[j]);
			}
	}else console.log("switch not exist");
}

function startmatch(f2,flow2){
	if(flow2.srcMac!="00:00:00:00:00:00")
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
	if(flow2.dstMac!="00:00:00:00:00:00")
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
	if(flow2.srcIP!="0.0.0.0")
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
	if(flow2.dstIP!="0.0.0.0")
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
	if(flow2.ingressPort!="0")
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
	if(flow2.netProtocol!="0")
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
	console.log("######congratulation######");
	nexthop(f2,flow2);
}

function nexthop(f3,flow3){
	//var title = $("circle.node title").text();
	//console.log("!!!!!title!!!!!");
	//console.log(title);
	var node = $("circle.node");
	//console.log(node);
	var length = node.length;
	for(var k=0;k<length;k++)
	{
		var nodeid = node[k].textContent;
		if(nodeid == f3["switch"])
		{
			node[k].style.fill="#00cc00";
			console.log("YAYAYAYAYAYA");
			
			for(var i in myGraph.links)
			{
				console.log("!!!!!!!!link!!!!!!!!!");
				var src = myGraph.links[i].source.id;
				//console.log(src);
				var dst = myGraph.links[i].target.id;
				//console.log(dst);
				var srcp = myGraph.links[i].sourcePort;
				//console.log(srcp);
				var dstp = myGraph.links[i].targetPort;
				//console.log(dstp);
				if(src==f3["switch"] && flow3.actions[0] && srcp==flow3.actions[0].value){
					//console.log(dst);
					//console.log(dstp);
					f3["switch"]=dst;
					f3["ingressPort"]=dstp;
					linkchangecolor(src,srcp,dst,dstp);
					getflowmsg(f3);
					
				}else if(dst==f3["switch"] && flow3.actions[0] && dstp==flow3.actions[0].value){
					//console.log(src);
					//console.log(srcp);
					f3["switch"]=src;
					f3["ingressPort"]=srcp;
					linkchangecolor(src,srcp,dst,dstp);
					getflowmsg(f3);
				}else{
					console.log("no next hop");
				}
			}
		}
	}	
}

function linkchangecolor(src,srcp,dst,dstp){
	var link = $("path.link");
	//console.log(link);
	var msg = "dpid " + src + ", port " + srcp + " -- " + "dpid " + dst + ", port " + dstp;
	var length = link.length;
	for(var k=0;k<length;k++)
	{
		if(link[k].textContent == msg)
		{
			link[k].style.stroke="#cccc00";
		}
	}
}

function clearlinkcolor(){
	var link = $("path.link");
	var length = link.length;
	for(var k=0;k<length;k++) link[k].style.stroke="#000";
}
