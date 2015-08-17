import React from 'react';
import config from "../../../../config/config.json";
import Immutable from "immutable";
require("whatwg-fetch");

let d3 = require('d3');
require('./topology.css');

var TYPE = {
  'SWITCH': 'switch',
  'AP': 'ap',
  'HOST': 'host',
  'DEVICE': 'device'
}

var topoNodes = [];
var topoLinks = [];
var link = {}; // svg link
var node = {}; // svg node
var force = {};

class Topology extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isSubscribe: false,
            isSetTopology: false,
            isFinish: true,
            errorMessage: null
        }
    }
    componentDidMount() {
      if (!this.state.isSubscribe)
        this.handleSubscribe();
      this.initialTopology();
    }

    initialTopology(){

        var renderDom = this.refs.topology.getDOMNode();
        var width = renderDom.offsetWidth ? renderDom.offsetWidth : 444;
        var height = renderDom.offsetHeight ? renderDom.offsetHeight : 300;

        var svg = d3.select('#topology')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .style({ 'left': '25px', 'top': '25px' })
          .call(
            d3.behavior.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", ()=>{
              container.attr("transform",
                             `translate(${d3.event.translate})scale(${d3.event.scale})`);
            }));
        var container = svg.append('g');

        force = d3.layout.force()
          .size([width/3*2, height/3*2])
          .charge(-400)
          .linkDistance(40)
          .linkStrength(0.3)
          .nodes(topoNodes)
          .links(topoLinks)
          .linkDistance(width / 4)
          .on('tick', () => {
            link
              .attr('x1', d => d.source.x)
              .attr('y1', d => d.source.y)
              .attr('x2', d => d.target.x)
              .attr('y2', d => d.target.y);
            node.selectAll('circle')
              .each(function(d, i) {
                d3.select(this)
                  .attr('cx', d => d.x)
                  .attr('cy', d => d.y);
              });
            node.selectAll('text')
              .each(function(d, i) {
                d3.select(this)
                  .attr('x', d => d.x - 5)
                  .attr('y', d => d.y + 5);
              });
          });
          force.drag()
            .on("dragstart", function(d){
              d3.event.sourceEvent.stopPropagation();
            })
            .on("drag", function(d){
              d3.select(this)
                .select('circle')
                .classed("choose", true);
            })
            .on("dragend", function(d) {
              d3.select(this)
                .select('circle')
                .classed("fixed", d.fixed = true)
                .classed("choose", false);
            });


        link = container.selectAll('.link').data(topoLinks);
        node = container.selectAll('.node').data(topoNodes)
    }

    updateTopo() {
      // Links
      link = link.data(force.links());
      link
        .enter()
        .insert("line", ":first-child")
        .attr('class', d => (d.type === 's2s') ? 'link s2s' : 'link s2h');
      link.exit().remove();

      // Node
      node = node.data(force.nodes());
      node
        .enter()
        .append('g')
        .each(function(d, i) {
          var g = d3.select(this);
          g.append('circle')
            .attr('class', e => (e.type === 'switch') ?
              'node switch' : 'node host')
            .attr("r", 15);
          g.append("text")
            .text(d => (d.type === 'switch') ? d.type[0].toUpperCase() +
              _.last(d.dpid) :
              d.type[0].toUpperCase() +
              _.last(d.mac)
            )
            .attr("fill", "#fff")
            .attr("font-size", "1em")
            .attr("cursor", "move");
        })
        .on("click", d => {
            console.log("Click = ", d);
        })
        .call(force.drag());

      node.exit().remove();
      force.start();
    }

    handleSubscribe(){
        var url = config.OmniUICoreURL + "subscribe";
        var evtSrc = new EventSource(url);
        this.setState({
            isSubscribe: true
        });
        evtSrc.addEventListener('adddevice', e => {
          this.addDevice(JSON.parse(e.data))
        });
        evtSrc.addEventListener('deldevice', e => {
          this.delDevice(JSON.parse(e.data))
        });
        evtSrc.addEventListener('addlink', e => {
          this.addLink(JSON.parse(e.data))
        });
        evtSrc.addEventListener('dellink', e => {
          this.delLink(JSON.parse(e.data))
        });
        evtSrc.addEventListener('addhost', e => {
          this.addHost(JSON.parse(e.data))
        });
        evtSrc.addEventListener('delhost', e => {
          this.delHost(JSON.parse(e.data))
        });
        evtSrc.addEventListener('addport', e => {
            this.addport(JSON.parse(e.data)) ;
        });
        evtSrc.addEventListener('delport', e => {
            this.delport(JSON.parse(e.data));
        });
        evtSrc.addEventListener('controller', e => {
            this.props.handleControllerStatus(JSON.parse(e.data));
        });
    }

    addDevice(e) {
      console.info("addDevice=", e);
      if (e.length !== undefined) {
        e.map(d => {
          topoNodes.push(d);
        });
      } else
        topoNodes.push(e);
      this.updateTopo();
    }

    delDevice(e) {
      console.info("delDevice ", e);
      let delIndex;
      for (let j = 0; j < topoNodes.length; j++) {
        if (topoNodes[j].dpid === e.dpid) {
          delIndex = j;
          break;
        }
      }
      topoNodes.pop(delIndex);
      this.updateTopo();
    }

    addLink(e) {
      if (e[0][0] !== undefined) {
        console.info("addLink", e);
        e.map(d => {
          topoLinks.push({
            source: this._findNodeIndex('switch', d[0].dpid),
            target: this._findNodeIndex('switch', d[1].dpid),
            sourcePort: d[0].port,
            targetPort: d[1].port,
            type: 's2s',
            linkId: d
          });
        });

        this.updateTopo();
      } else {
        console.log('add single link ', e);
        topoLinks.push({
          source: this._findNodeIndex('switch', e[0].dpid),
          target: this._findNodeIndex('switch', e[1].dpid),
          sourcePort: e[0].port,
          targetPort: e[1].port,
          type: 's2s',
          linkId: e
        });
        this.updateTopo();
      }
    }

    delLink(e) {
      console.info("delLink", e);
      if (_.remove(topoLinks, d => _.isEqual(d.linkId, e)))
        this.updateTopo();
      else
        console.log("Link Not found");
    }

    addHost(e) {

      if (e.length !== undefined) {
        console.info("addHost ", e);
        e.map( host => {
          this._addHostNode(host).then((i)=>{
            host.aps.map((link, index) => {
              topoLinks.push({
                source: this._findNodeIndex('switch', link.dpid),
                target: i-1,
                sourcePort: link.port,
                targetPort: index,
                type: 's2h',
                linkId: host.mac
              });
            })
          });
        });

      } else {
        console.info("add single Host ", e);
        this._addHostNode(e).then((i)=>{
          e.aps.map((link, index) => {
            topoLinks.push({
              source: this._findNodeIndex('switch', link.dpid),
              target: i-1,
              sourcePort: link.port,
              targetPort: index,
              type: 's2h',
              linkId: e.mac
            });
          })
        });
      }
    }

    _addHostNode(d) {
      return new Promise((resolve, reject) => {
        resolve(topoNodes.push(d));
      })
    }

    delHost(e) {
      console.info("delHost", e);
      if (_.remove(topoLinks, d => _.isEqual(d.linkId, e.mac)))
        this.updateTopo();
      else
        console.log("Link Not found");
    }

    _findNodeIndex(type, uuid) {
      switch (type) {
        case "switch":
          return _.findIndex(topoNodes, d => d.type === type && d.dpid === uuid);
        case "host":
          return _.findIndex(topoNodes, d => d.type === type && d.mac === uuid);
      }
    }

    addport(e) {
        var port = e;
    }
    delport(e) {
        var port = e;
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
