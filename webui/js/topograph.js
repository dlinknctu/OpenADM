function TopoGraph() {
	var nodes = [];
	var links = [];

	this.nodes = nodes;
	this.links = links;

	// Add and remove elements on the graph object
	this.addNode = function (name, id, ports, flows) {
		nodes.push({
			"id": id,
			"name": name,
			"ports": ports,
			"flows": flows
		});
	};

	this.addLink = function (source, target, sourcePort, targetPort) {
		links.push({"source": findNodeIndex(source), "target": findNodeIndex(target), "sourcePort": sourcePort, "targetPort": targetPort});
	};

	this.removeNode = function (id) {
		var i = 0;
		var n = findNode(id);
		while (i < links.length) {
			if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
				links.splice(i,1);
			}
			else i++;
		}
		nodes.splice(findNodeIndex(id), 1);
	};

	this.removeLink = function (source, target) {
		for(var i = 0; i < links.length; i++)
		{
			if(links[i].source.id == source && links[i].target.id == target)
			{
				links.splice(i,1);
				break;
			}
		}
	};

	this.removeallLinks = function(){
		links.splice(0, links.length);
		redraw(nodes, links);
	};

	this.removeAllNodes = function(){
		nodes.splice(0, links.length);
	};

	var findNode = function(id) {
		for (var i in nodes) {
			if (nodes[i]["id"] === id) { 
				return nodes[i];
			}
		};
	};
	this.findNode = findNode;

	var findNodeIndex = function(id) {
		for (var i=0; i < nodes.length; i++) {
			if (nodes[i]["id"] === id) {
				return i;
			}
		}
	}
	this.findNodeIndex = findNodeIndex;

	var findLink = function(source, target) {
		for(var i in links) {
			if(links[i].source.id == source && links[i].target.id == target) {
				return links[i];
			}
		}
	}
	this.findLink = findLink;
}
