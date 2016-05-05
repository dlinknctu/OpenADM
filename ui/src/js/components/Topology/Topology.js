import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import d3 from 'd3';
import _ from 'lodash';
import './topology.less';

const TYPE = {
  'SWITCH': 'switch',
  'AP': 'ap',
  'HOST': 'host',
  'DEVICE': 'device'
}

let force = d3.layout.force();

const nodeDrag = force.drag()
      .on("dragstart", function(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this)
          .select('circle')
          .classed("fixed", d.fixed = true)
          .classed("dragging", true);
          force.resume();
      })
      .on("drag", null)
      .on("dragend", function(d) {
        d3.select(this)
          .select('circle')
          .classed("dragging", false)
          .classed("fixed", d.fixed = true);
      });

const enterNode = (selection) => {
  selection.classed('node', true);
  selection.append('circle')
    .attr('class', e => (e.type === 'switch') ? 'node switch' : 'node host')
    .attr("r", 15)
    .on("click", function(d) {
      // _this.props.chooseTopologyNode(d);
      d3.select(this)
        .select('circle')
        .classed("choose", false);
    })
    .on("dblclick", function(d) {
      d3.select(this)
        .select('circle')
        .classed("fixed", d.fixed = false);
    })
    .call(nodeDrag);

  selection.append('text')
    .attr("font-size", "1em")
    .attr("x", d => d.x + 5)
    .attr("y", d => d.y + 5)
    .text(d => (d.type === 'switch') ? d.type[0].toUpperCase() +
      _.last(d.dpid) :
      d.type[0].toUpperCase() +
      _.last(d.mac)
    );
};


const updateNode = (selection) => {
  selection.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
};

const enterLink = (selection) => {
  selection.classed('link', true)
    .attr('class', d => (d.type === 's2s') ? 'link s2s' : 'link s2h');
};
const updateLink = (selection) => {
  selection.attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
};
const updateGraph = (selection) => {
  selection.selectAll('.node')
    .call(updateNode);
  selection.selectAll('.link')
    .call(updateLink);
};

class Topology extends React.Component {

  constructor(props) {
    super(props);
    let stickyTopo;
    this.state = {
      isFinish: true,
      errorMessage: null,
      stickyTopo: stickyTopo
    }
  }
  componentDidMount() {
    this.initialTopology();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.nodes.size === this.props.nodes.size &&
        nextProps.links.size === this.props.links.size)
      return false;
    console.log("updateTopo");
    this.updateTopo(nextProps);
    return false;
  }

  initialTopology() {
    const renderDom = findDOMNode(this.refs.topology);

    const width = renderDom.width.baseVal.value ? renderDom.width.baseVal.value : 444;
    const height = renderDom.height.baseVal.value ? renderDom.height.baseVal.value : 600;

    d3.select(renderDom)
      .style({ 'left': '25px', 'top': '25px' })
      .call(
        d3.behavior.zoom()
          .scaleExtent([0.1, 10])
          .on("zoom", () => {
            this.container.attr("transform",
            `translate(${d3.event.translate})scale(${d3.event.scale})`);
          })
      );
    this.container = d3.select(findDOMNode(this.refs.container));
    force = d3.layout.force()
      .size([width / 3 * 2, height / 3 * 2])
      .charge(-2000)
      .linkStrength(0.5)
      .linkDistance(width / 6)
      .on('tick', () => {
        this.container.call(updateGraph);
      });
  }

  updateTopo(nextProps) {
    let _this = this;
    const topoNodes = nextProps.nodes.toJS();
    const topoLinks = nextProps.links.toJS();
    let node = this.container.selectAll('.node')
      .data(topoNodes, d => d.key);
    let link = this.container.selectAll('.link')
      .data(topoLinks, d => `${d.source}-${d.target}`);

    // Node
    node.enter().append('g').call(enterNode);
    node.exit().remove();
    node.call(updateNode);

    // Links
    link.enter().insert("line", ".node").call(enterLink);
    link.exit().remove();
    link.call(updateLink);

    force.nodes(topoNodes).links(topoLinks);
    force.start();

    // this.props.updateTopology({
    //   nodes: force.nodes(),
    //   links: force.links(),
    // });
  }

  _saveToLocalStorage() {
    console.log("_saveToLocalStorage");
    // if (global.localStorage) {
    //     if (this.state.stickyTopo.entries() !== null ){
    //       global.localStorage.setItem('topology', JSON.stringify(
    //         Array.from( this.state.stickyTopo.entries() )));
    //     }
    // }
  }

  // handleSubscribe(){
  //     let evtSrc = this.props.evnetSource;
  //     evtSrc.addEventListener('adddevice', e => {
  //       this.addDevice(JSON.parse(e.data))
  //     });
  //     evtSrc.addEventListener('deldevice', e => {
  //       this.delDevice(JSON.parse(e.data))
  //     });
  //     evtSrc.addEventListener('addlink', e => {
  //       this.addLink(JSON.parse(e.data))
  //     });
  //     evtSrc.addEventListener('dellink', e => {
  //       this.delLink(JSON.parse(e.data))
  //     });
  //     evtSrc.addEventListener('addhost', e => {
  //       this.addHost(JSON.parse(e.data))
  //     });
  //     evtSrc.addEventListener('delhost', e => {
  //       this.delHost(JSON.parse(e.data))
  //     });
  //     evtSrc.addEventListener('addport', e => {
  //         this.addport(JSON.parse(e.data)) ;
  //     });
  //     evtSrc.addEventListener('delport', e => {
  //         this.delport(JSON.parse(e.data));
  //     });
  // }
  //
  // addDevice(e) {
  //   console.info("addDevice=", e);
  //   if (e.length !== undefined) {
  //     e.map(d => {
  //       let position = this.state.stickyTopo.get(d.dpid) || null;
  //       if (position)
  //         d = _.assign(d, { x: position.x, y: position.y, fixed: true });
  //       topoNodes.push(d);
  //     });
  //   } else
  //     topoNodes.push(e);
  //   this.updateTopo();
  // }
  //
  // delDevice(e) {
  //   console.info("delDevice ", e);
  //   if (_.remove(topoNodes, d => _.isEqual(d.dpid, e.dpid)))
  //     this.updateTopo();
  //   else
  //     console.log("Device Not found");
  // }
  //
  // addLink(e) {
  //   if (e[0][0] !== undefined) {
  //     console.info("addLink", e);
  //     e.map(d => {
  //       topoLinks.push({
  //         source: this._findNodeIndex('switch', d[0].dpid),
  //         target: this._findNodeIndex('switch', d[1].dpid),
  //         sourcePort: d[0].port,
  //         targetPort: d[1].port,
  //         type: 's2s',
  //         linkId: d
  //       });
  //     });
  //
  //     this.updateTopo();
  //   } else {
  //     console.log('add single link ', e);
  //     topoLinks.push({
  //       source: this._findNodeIndex('switch', e[0].dpid),
  //       target: this._findNodeIndex('switch', e[1].dpid),
  //       sourcePort: e[0].port,
  //       targetPort: e[1].port,
  //       type: 's2s',
  //       linkId: e
  //     });
  //     this.updateTopo();
  //   }
  // }
  //
  // delLink(e) {
  //   console.info("delLink", e);
  //   if (_.remove(topoLinks, d => _.isEqual(d.linkId, e)))
  //     this.updateTopo();
  //   else
  //     console.log("Link Not found");
  // }
  //
  // addHost(e) {
  //
  //   if (e.length !== undefined) {
  //     console.info("addHost ", e);
  //     e.map( host => {
  //       let position = this.state.stickyTopo.get(host.mac) || null;
  //       if (position)
  //         host = _.assign(host, { x: position.x, y: position.y, fixed: true });
  //
  //       this._addHostNode(host)
  //         .then((i) => {
  //           let sourceNode = this._findNodeIndex('switch', host.location.dpid);
  //           topoLinks.push({
  //           source: sourceNode,
  //           target: i-1,
  //           sourcePort: host.location.port,
  //           type: 's2h',
  //           linkId: host.mac
  //         });
  //           this.updateTopo();
  //         }).catch(err => {
  //           console.log("Add host error ", err);
  //         });
  //     });
  //
  //   } else {
  //     console.info("add single Host ", e);
  //     this._addHostNode(e).then((i)=>{
  //       topoLinks.push({
  //         source: this._findNodeIndex('switch', e.location.dpid),
  //         target: i-1,
  //         sourcePort: e.location.port,
  //         type: 's2h',
  //         linkId: e.mac
  //       });
  //       this.updateTopo();
  //     });
  //   }
  // }
  //
  // _addHostNode(d) {
  //   return new Promise((resolve, reject) => {
  //     resolve(topoNodes.push(d));
  //   })
  // }
  //
  // delHost(e) {
  //   console.info("delHost", e);
  //
  //   if (_.remove(topoLinks, d => _.isEqual(d.linkId, e.mac))){
  //     if (_.remove(topoNodes, d => _.isEqual(d.mac, e.mac)))
  //       this.updateTopo();
  //   }
  //   else
  //     console.log("Link Not found");
  // }
  //
  // _findNodeIndex(type, uuid) {
  //   switch (type) {
  //     case "switch":
  //       return _.findIndex(topoNodes, d => d.type === type && d.dpid === uuid);
  //     case "host":
  //       return _.findIndex(topoNodes, d => d.type === type && d.mac === uuid);
  //   }
  // }
  //
  // addport(e) {
  //   // console.info("addport", e);
  //   var port = e;
  // }
  // delport(e) {
  //   // console.info("delport", e);
  //   var port = e;
  // }

  render() {
    return (
      <svg
        id="topology"
        className="topology"
        ref="topology"
      >
        <g ref="container" />
      </svg>
    );
  }
}


Topology.propTypes = {
  chooseTopologyNode: PropTypes.func.isRequired,
};
export default Topology;
