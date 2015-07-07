
import React from 'react';
import config from "../../../../config/config.json";
require("whatwg-fetch");

let d3 = require('d3');
require('./topology.css');
var graph = require('./Topology_d3.js');
var TYPE = {
  'SWITCH': 'switch',
  'AP': 'ap',
  'HOST': 'host',
  'DEVICE': 'device'
}
var OmniUI = {
  nodes: [
    // {"id": "00:00:00:00:0f", "uuid": 120311234,"type": "host"},
    // {"id": "00:00:00:00:0a", "uuid": 320312351,"type": "host"}
  ],
  links: []
}
var topologyNodes =[];
var topologyLinks = [];
var link = {}; // svg link
var node = {}; // svg node
var force = {};
var focusNode = {};

class Topology extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isSubscribe: false,
            isFinish: true,
            errorMessage: null,
            lastFocusNode: {},
            // { type, id }  mac or dpid lastFocusNode (for dishighlight)
        }
    }

    componentDidMount() {
      this.handleSubscribe();
      this.initialTopology();
    }

    initialTopology(){
      // var renderDom = document.getElementById('container');
      // var width = renderDom.offsetWidth ? renderDom.offsetWidth : 500,
      // var height = renderDom.offsetHeight ? renderDom.offsetHeight : 500;
        const width = 400;
        const height = 300;

        var svg = d3.select("#topology").append("svg")
              .attr("width", width)
              .attr("height", height);

        link = svg.selectAll(".link");
        node = svg.selectAll(".node");

        force = d3.layout.force()
              .size([width, height])
              .charge(-400)
              .linkDistance(40)
              .on("tick", function() {
                link.attr("x1", d => d.source.x )
                    .attr("y1", d => d.source.y )
                    .attr("x2", d => d.target.x )
                    .attr("y2", d => d.target.y );
                node.selectAll('circle')
                  .each(function(d,i){
                      var circle = d3.select(this);
                      circle.attr('cx', d.x)
                            .attr('cy', d.y);
                  });
                node.selectAll('text')
                  .each( function(d,i) {
                      var text = d3.select(this);
                      text.attr('x', d.x - 5)
                          .attr('y', d.y + 5);
                  });
              });

        force.nodes(OmniUI.nodes)
            .links(OmniUI.links)
            .start();
        topologyNodes = force.nodes();
        topologyLinks = force.links();
        var drag = force.drag().on("dragstart", function(d){
              d3.select(this)
                .selectAll('circle')
                .classed("fixed", d.fixed = true);
            });
    }

  updateTopology() {
    var _this = this;

    link = link.data(topologyLinks, d => d.source.uuid + "-" + d.target.uuid)
    link.enter().append("line").attr("class", "link").attr("z-index", "-1");
    link.exit().remove();

    node = node.data(topologyNodes);
    node.enter()
      .append('g')
      .each(function(d, i) {
        var g = d3.select(this);
        g.append('circle')
         .attr("class", "node "+ d.type)
         .attr("r", 15);
        g.append("text")
         .text(d => d.type[0].toUpperCase())
         .attr("fill", "#fff")
         .attr("font-size","1em");
      })
      .on("click", click)
      .on("dblclick", dblclick);
      // node.call(drag);
    node.exit().remove();

    force.start();

    /**
     * will merge
     */
    function click(d) {
      if (focusNode.id === 'none' ){
          d3.select(this)
            .selectAll('circle')
            .classed("choose", d.choose = true);
            focusNode = {
              id: d.dpid,
              type: d.type,
              uuid: d.uuid,
              focusDom: this
            };
            _this.handleTopologyNodeClick();
      }
      else if (focusNode.id === d.id){
        d3.select(this)
          .selectAll('circle')
          .classed("choose", d.choose = false);
        focusNode = {
          id: 'none',
          type: 'switch',
          uuid: '0'
        };
        _this.handleTopologyNodeClick();
      }
      else if (focusNode.id !== d.id){
        // highlight click and unhighlight perview
          d3.select(this)
            .selectAll('circle')
            .classed("choose", d.choose = true);
          d3.select(focusNode.focusDom)
          .selectAll('circle')
          .classed("choose", d.choose = false);

          focusNode = {
            id: d.dpid,
            type: d.type,
            uuid: d.uuid
          };
          _this.handleTopologyNodeClick();
      }
    }
    function dblclick(d) {
      // 取消 pin and chooose
      d3.select(this)
        .selectAll('circle')
        .classed("fixed", d.fixed = false);
      d3.select(this)
        .selectAll('circle')
        .classed("choose", false);
    }
    var drag = force.drag().on("dragstart", function(d){
          d3.select(this)
            .selectAll('circle')
            .classed("fixed", d.fixed = true);
        }).bind(this);
  }

  _findNodeIndex(uuid) {
      for (var i=0; i < topologyNodes.length; i++) {
          if (topologyNodes[i].uuid === uuid)
              return i
      };
  }

  // 直接給新的node
  addTopologyNode(newNode){
     topologyNodes.push(newNode);
     this.updateTopology();
  }
  // delet node give uuid
  delTopologyNode(uuid){
    for (var i=0; i < topologyNodes.length; i++) {
        if (topologyNodes[i].uuid === uuid)
            topologyNodes.pop(i);
    };
    this.updateTopology();
  }

  // 給兩個uuid會建立兩個之間的link
  addTopologyLink(source, target) {
    topologyLinks.push({
      "source": this._findNodeIndex(source),
      "target": this._findNodeIndex(target)
    });

    this.updateTopology();
  };
  // 給兩個uuid會刪除兩個之間的link
  delTopologyLink(source,target){
      for(var i=0;i< topologyLinks.length;i++){
          if(topologyLinks[i].source.uuid == source && topologyLinks[i].target.uuid == target){
              topologyLinks.splice(i,1);
              break;
          }
      }
      this.updateTopology();
  };

  handleTopologyNodeClick() {
    console.log("handleTopologyNodeClick", focusNode);
    this.props.onChagneFocusID(focusNode);
  }

    handleSubscribe(){
        if (typeof(this.state.evtSrc) !== "object") {
            var url = config.OmniUICoreURL + "subscribe";

            var evtSrc = new EventSource(url);
            this.setState({
                evtSrc: evtSrc
            });
            evtSrc.addEventListener('addlink', e => {
                this.addlink(e);
            });
            evtSrc.addEventListener('dellink', e => {
                this.dellink(e);
            });
            evtSrc.addEventListener('adddevice', e => {
                this.adddevice(e);
            });
            evtSrc.addEventListener('deldevice', e => {
                this.deldevice(e);
            });
            evtSrc.addEventListener('addport', e => {
                this.addport(e) ;
            });
            evtSrc.addEventListener('delport', e => {
                this.delport(e);
            });
            evtSrc.addEventListener('addhost', e => {
                this.addhost(e);
            });
            evtSrc.addEventListener('delhost', e => {
                this.delhost(e);
            });
            evtSrc.addEventListener('controller', e => {
                this.props.handleControllerStatus(JSON.parse(e.data));
            });
          }
    }

    adddevice(e) {
        var device = JSON.parse(e.data);
        if ( device.length === 0)
          return 0;
        setTimeout((a) => {
          for (var i = 0; i < device.length; i++) {
            this.addTopologyNode(device[i]);
          };
        }, 500);
    }

    deldevice(e) {
        var device = JSON.parse(e.data);
        if ( device.length === 0)
          return 0;
        setTimeout((a) => {
          for (var i = 0; i < device.length; i++) {
            this.delTopologyNode(device[i]);
          };
        }, 500);
    }

    addlink(e) {
        var link = JSON.parse(e.data);
        if( link.length === 0)
          return 0;
        console.log('add link ', link);
        setTimeout((a) => {
          for (var i = 0; i < link.length; i++) {
            this.addTopologyLink(link[i][0].uuid, link[i][1].uuid);
          };
        }, 1000);
    }

    dellink(e) {
        var link = JSON.parse(e.data);
        if( link.length === 0)
          return 0;
        console.log('del link ', link);
        setTimeout((a) => {
          for (var i = 0; i < link.length; i++) {
            this.delTopologyLink(link[i][0].uuid, link[i][1].uuid);
          };
        }, 1000);
    }

    addhost(e) {
        var host = JSON.parse(e.data);
        console.log("add host ", host );
        if ( host.length === 0)
          return 0;
        setTimeout((a) => {
          for (var i = 0; i < host.length; i++) {
            this.addTopologyNode(host[i]);
          };
        }, 500);
    }

    delhost(e) {
      host = JSON.parse(e.data);
      console.log("del host ", host );
        if ( host.length === 0)
          return 0;
        setTimeout((a) => {
          for (var i = 0; i < host.length; i++) {
            this.delTopologyNode(host[i]);
          };
        }, 500);
    }

    }
    addport(e) {
        var port = JSON.parse(e.data);
    }
    delport(e) {
        var port = JSON.parse(e.data);
    }

    render() {
        return (
          <div>
            <div id="topology"
                ref="topology">
            </div>
        );
    }
}

export default Topology;
