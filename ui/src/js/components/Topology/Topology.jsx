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

class Topology extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isSubscribe: false,
            isFinish: true,
            errorMessage: null,
            devices: [], // [ {type switch, dpip}, ]
            hosts: [],   // [ {ips , mac, aps{ port, dpid }}, ]
            links: [],   // [ [{src_port, src_dpid}, { dst_port, dst_dpid }], ]
            focusNode: { type: 'none', id: 'none', lastFocusNode: {}},
            // { type, id }  mac or dpid lastFocusNode (for dishighlight)
        }
    }

    componentDidMount() {
        this.handleSubscribe();

        var d3dom = this.refs.topology.getDOMNode();
        this.drawTopology();
    }
    componentDidUpdate(){

    }
    drawTopology(){
        var _this = this;
        const width = 400;
        const height = 300;

        var topologyLayout = d3.layout.force()
            .size([width, height])
            .charge(-400)
            .linkDistance(40)
            .on("tick", tick);

        var svg = d3.select("#topology").append("svg")
            .attr("width", width)
            .attr("height", height);

        var link = svg.selectAll(".link"),
            node = svg.selectAll(".node");

        topologyLayout.nodes(graph.nodes)
          .links(graph.links)
          .start();

        link = link.data(graph.links)
        .enter().append("line")
        .attr("class", "link");

        node = node.data(graph.nodes)
          .enter()
          .append('g')
          .each(function(node) {
            let g = d3.select(this);
            switch(node.type) {
              case TYPE.SWITCH:
                g.append('circle')
                 .attr("class", "node switch")
                 .attr("r", 10);
                  break;
              case TYPE.AP:
                g.append('circle')
                 .attr("class", "node ap")
                 .attr("r", 10);
                  break;
              case TYPE.DEVICE:
                g.append('circle')
                 .attr("class", "node device")
                 .attr("r", 10);
                  break;
              case TYPE.HOST:
                g.append('circle')
                 .attr("class", "node host")
                 .attr("r", 10);
                 break;
            }
          })
          .on("click", function (node) {
            if (_this.state.focusNode.id === 'none' ){
                _this.handleFocusNode(node, this);
                d3.select(this)
                  .selectAll('circle')
                  .classed("choose", node.choose = true);
            }
            else if (_this.state.focusNode.id !== node.id){
                d3.select(this)
                  .selectAll('circle')
                  .classed("choose", node.choose = true);
                d3.select(_this.state.focusNode.lastFocusNode)
                .selectAll('circle')
                .classed("choose", node.choose = false);

                _this.handleFocusNode(node, this);
            }
          })
          .on("dblclick", function (node) {
              d3.select(this)
                .selectAll('circle')
                .classed("fixed", node.fixed = false);
              d3.select(_this.state.focusNode.lastFocusNode)
                .selectAll('circle')
                .classed("choose", node.choose = false);
              _this.handleFocusNode(node, null);
            }
          )
          .call(topologyLayout.drag()
            .on("dragstart", function(d) {
              d3.select(this)
                .selectAll('circle')
                .classed("fixed", d.fixed = true);
            })
          );
        //text
        node.append("text")
            .text(function(d, i) { return d.type[0].toUpperCase(); })
            .attr("fill",function(d, i) {  return  "#fff";  })
            .attr("font-size",function(d, i) {  return  "1em"; });


        function tick() {
          link.attr("x1", d => d.source.x )
              .attr("y1", d => d.source.y )
              .attr("x2", d => d.target.x )
              .attr("y2", d => d.target.y );

          node.selectAll('text')
            .each( function(d,i) {
                var text = d3.select(this);
                text.attr('x', d.x - 5)
                    .attr('y', d.y + 5);
            });

          node.selectAll('circle')
            .each( function(d,i) {
                var circle = d3.select(this);
                circle.attr('cx', d.x)
                      .attr('cy', d.y);
            });
        }

    }

    handleFocusNode(node, domNode){
        this.setState({
            focusNode: {
                type: node.type,
                id: node.id,
                lastFocusNode: domNode
            }
        });
        console.log('You choose ', this.state.focusNode);
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
        }
    }

    adddevice(e) {
        var device = JSON.parse(e.data);
        this.setState({
            devices: this.state.devices.concat(device)
        });
    }
    deldevice(e) {
        var device = JSON.parse(e.data);
        this.setState({
            devices: this.state.devices.filter( (element) => {
                return (
                    element.dpid != device.dpid
                );
            })
        });
    }
    addlink(e) {
        var link = JSON.parse(e.data);
        this.setState({
            links: this.state.links.concat(link)
        });
    }
    dellink(e) {
        var link = JSON.parse(e.data);
        this.setState({
            links: this.state.links.filter( (element) => {
                return (
                    !((element.dpid == device[0].dpid) &&
                        (element.dpid == device[1].dpid))
                );
            })
        });
    }
    addhost(e) {
        var host = JSON.parse(e.data);
        this.setState({
            hosts: this.state.devices.concat(host)
        });
    }
    delhost(e) {
        var host = JSON.parse(e.data);
    }
    addport(e) {
        var port = JSON.parse(e.data);
    }
    delport(e) {
        var port = JSON.parse(e.data);
    }

    render() {
        return (
            <div id="topology"
                ref="topology">
            </div>
        );
    }
}

export default Topology;
