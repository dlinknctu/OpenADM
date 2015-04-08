// set up SVG for D3
var width  = 800,
	height = 480,
	colors = d3.scale.category10();

var svg = d3.select('#content')
.append('svg')
.attr('width', width)
.attr('height', height);

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
.attr('id', 'end-arrow')
.attr('viewBox', '0 -5 10 10')
.attr('refX', 6)
.attr('markerWidth', 3)
.attr('markerHeight', 3)
.attr('orient', 'auto')
.append('svg:path')
.attr('d', 'M0,-5L10,0L0,5')
.attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
.attr('id', 'start-arrow')
.attr('viewBox', '0 -5 10 10')
.attr('refX', 4)
.attr('markerWidth', 3)
.attr('markerHeight', 3)
.attr('orient', 'auto')
.append('svg:path')
.attr('d', 'M10,-5L0,0L10,5')
.attr('fill', '#000');

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
		circle = svg.append('svg:g').selectAll('g');

var lastSelectedItem = "";

var opts = {
    lines: 15, // The number of lines to draw
    length: 9, // The length of each line
    width: 3, // The line thickness
    radius: 13, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
};
var target = document.getElementById('waiting');

// update force layout (called automatically each iteration)
function tick() {
	// draw directed edges with proper padding from node centers
	path.attr('d', function(d) {
		var deltaX = d.target.x - d.source.x,
		deltaY = d.target.y - d.source.y,
		dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
		normX = deltaX / dist,
		normY = deltaY / dist,
		sourcePadding = 8,
		targetPadding = 8,
		sourceX = d.source.x + (sourcePadding * normX),
		sourceY = d.source.y + (sourcePadding * normY),
		targetX = d.target.x - (targetPadding * normX),
		targetY = d.target.y - (targetPadding * normY);
	return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
	});

	circle.attr('transform', function(d) {
		return 'translate(' + d.x + ',' + d.y + ')';
	});
}

function mouseover() {
	d3.select(this).select("circle").transition()
		.duration(750)
		.attr("r", 10);
}

function mouseout() {
	d3.select(this).select("circle").transition()
	.duration(750)
	.attr("r", 8);
}

function mouseclick() {
	clearcolor();
	d3.select(this).select("circle").style('fill', "#33BBEE");
	lastSelectedItem = d3.select(this);

	// get flow/port table of selected node
	node = myGraph.findNode(lastSelectedItem.select("title").text());
	flows = node.flows;
	ports = node.ports;

	// generate leftcolumn from dpid
	$("#info").empty().append("DPID <br/>" + node.id + "<br/><br/> Port Count <br/>" + ports.length + "<br/><br/> Flow Count <br/>" + flows.length);

	// generate footer from the flow table
	$("#flows").empty();
	for(var i in flows) {
        var actions = flows[i].actions;
        var actionsStrArr = [];
        for(var j in actions) {
            if("value" in actions[j]) {
                actionsStrArr.push(actions[j].type + " " + actions[j].value);
            } else {
                actionsStrArr.push(actions[j].type);
            }
        }
		$("#flows").append("<tr>\
        <td>" + flows[i].ingressPort + "</td>\
        <td>" + flows[i].vlan + "</td>\
        <td>" + flows[i].vlanP + "</td>\
        <td>" + flows[i].srcMac + "</td>\
        <td>" + flows[i].dstMac + "</td>\
        <td>" + flows[i].dlType + "</td>\
        <td>" + flows[i].srcIP +"/"+ flows[i].srcIPMask + "</td>\
        <td>" + flows[i].dstIP +"/"+ flows[i].dstIPMask + "</td>\
        <td>" + flows[i].netProtocol + "</td>\
        <td>" + flows[i].srcPort + "</td>\
        <td>" + flows[i].dstPort + "</td>\
        <td>" + actionsStrArr.toString() + "</td>\
        <td>" + flows[i].counterPacket + "</td>\
        <td>" + flows[i].counterByte + "</td>\
        <td>" + flows[i].hardTimeout + "</td>\
		<td>" + flows[i].idleTimeout + "</td>\
		<td><button onclick='modFlow(" + i + ");'>Modify</button><button onclick='delFlow(" + i + ");'>Delete</button><button onclick='highlight(" + i + ");'>Simulate</button></td>\
		</tr>");
	}
	preMatching($('#flows tr'), $('#flowtable input:text'));

	// generate rightcolumn from the port table
	$("#ports").empty();
	for(var i in ports) {
		$("#ports").append("<tr>\
		<td>" + ports[i].PortNumber + "</td>\
		<td>" + ports[i].recvPackets + "</td>\
		<td>" + ports[i].recvBytes + "</td>\
		<td>" + ports[i].transmitPackets + "</td>\
		<td>" + ports[i].transmitBytes + "</td>\
		</tr>");
	}
}

var force = d3.layout.force()
.size([width, height])
.linkDistance(30)
.charge(-250);

var myGraph = new TopoGraph();

// update graph (called when needed)
function redraw(nodes, links) {

	// init D3 force layout
	force.nodes(nodes)
		.links(links)
		.on('tick', tick);

	// path (link) group
	path = path.data(force.links());

	// update existing links
	path.style('marker-start', function(d) { return ''; })
		.style('marker-end', function(d) { return ''; });

	// add new links
	path.enter().append('svg:path')
		.attr('class', 'link')
		.style('marker-start', function(d) { return ''; })
		.style('marker-end', function(d) { return ''; })
		.append('svg:title')
		.text(function(d) { return "dpid " + myGraph.nodes[d.source].id + ", port " + d.sourcePort + " -- " + "dpid " + myGraph.nodes[d.target].id + ", port " + d.targetPort; });

	// remove old links
	path.exit().remove();


	// circle (node) group
	// NB: the function arg is crucial here! nodes are known by id, not by index!
	circle = circle.data(force.nodes(), function(d) { return d.id; });

	// update existing nodes (reflexive & selected visual states)
	circle.selectAll('circle')
		.style('fill', function(d) {
			return "#FF9900"; 
		});

	// add new nodes
	var g = circle.enter().append('svg:g');

	g.append('svg:circle')
		.attr('class', 'node')
		.attr('r', 8)
		.style('fill', function(d) {
			return "#FF9900"; 
		})
		.style('stroke', function(d) { 
			return "black"; 
		})
		.append("svg:title")
		.text(function(d) { return d.id; });

	// show node IDs
	/*
	g.append('svg:text')
		.attr('x', 15)
		.attr('y', 5)
		.attr('class', 'name')
		.text(function(d) { return d.name; });
	*/

	circle.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("click", mouseclick);
	circle.call(force.drag);

	// remove old nodes
	circle.exit().remove();

	// set the graph in motion
	force.start();
}

function updateTopo(json) {

	// remove deleted nodes
	var delNodes = [];
	for(var i in myGraph.nodes) {
		var foundMatch = false;
		var nodeId = myGraph.nodes[i].id;
		for(var j in json.nodes) {
			if(nodeId == json.nodes[j].id) {
				foundMatch = true;
				break;
			}
		}
		if(!foundMatch) {
			delNodes.push(nodeId);
		}
	}

	// remove deleted links
	var delLinks = [];
	for(var i in myGraph.links) {
		var foundMatch = false;
		var sourceNode = myGraph.links[i].source;
		var targetNode = myGraph.links[i].target;
		var sourceNodeId = sourceNode.id;
		var targetNodeId = targetNode.id;
		for(var j in json.links) {
			var jsonLinkSourceId = json.links[j].source;
			var jsonLinkTargetId = json.links[j].target;
			if(sourceNodeId == jsonLinkSourceId && targetNodeId == jsonLinkTargetId) {
				foundMatch = true;
				break;
			}
		}
		if(!foundMatch) {
			delLinks.push({source: sourceNodeId, target: targetNodeId});
		}
	}

	for(var i in delNodes) {
		myGraph.removeNode(delNodes[i]);
	}

	for(var i in delLinks) {
		myGraph.removeLink(delLinks[i].source, delLinks[i].target);
	}

	// add nodes that are not present
	for(var i in json.nodes) {
		if(myGraph.findNode(json.nodes[i].dpid) == undefined) {
			myGraph.addNode(json.nodes[i].dpid, json.nodes[i].dpid, json.nodes[i].ports, json.nodes[i].flows);
		}
	}

	// add links that are not present
	for(var i in json.links) {
		if(myGraph.findLink(json.links[i].source, json.links[i].target) == undefined) {
			myGraph.addLink(json.links[i].source, json.links[i].target, json.links[i].sourcePort, json.links[i].targetPort);
		}
	}

	redraw(myGraph.nodes, myGraph.links);

}

function loadJSONP(){
	$.ajax({
	   type: "GET",
	   url: getTopologyUrl(),
	   dataType: "jsonp",
	   jsonpCallback: "omniui",
	   success: function(json){
	       updateTopo(json);
           spinner.stop();
	   },
	   error: function(){
	       alert('Fail loading topology');
           spinner.stop();
	   }
	});
}

function sendFlow(f){

    for(var i in f) {
        if(f[i]!=null) f[i] = f[i].replace(/\s+/g, "");
    }
    var url = getFlowModUrl();
    var data = JSON.stringify(f);
    var callback = function(resp) {
        console.log(resp);
        loadJSONP();
        $("#info").empty();
        clearcolor();
    };
    console.log(data);
    spinner.spin(target);
    $.post(url, data, callback, "json");
}

function serverSentEvent() {
    var evtSrc = new EventSource(getSubscribeUrl());
    evtSrc.addEventListener('updatetopo', function(e) {
        updateTopo(JSON.parse(e.data));
    }, false);
}

