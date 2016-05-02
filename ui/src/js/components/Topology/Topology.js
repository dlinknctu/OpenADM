import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import d3 from 'd3';
import './topology.less';

// *****************************************************
// ** d3 functions to manipulate attributes
// *****************************************************
const width = 600;
const height = 500;
const force = d3.layout.force()
  .charge(-5000)
  .chargeDistance(400)
  .linkDistance(30)
  .linkStrength(1)
  .friction(0.5)
  .size([width, height]);
const color = d3.scale.category20();

const nodeDrag = force.drag()
        .on("dragstart", function(d){
          force.stop();
          d3.select(this).classed('dragging', true);
        })
        .on("drag", function(d) {
        })
        .on("dragend", function(d) {
          d3.select(this)
          .classed('fixed', d.fixed = true)
          .classed('dragging', false);
          force.stop();
        });

const enterNode = (selection, chooseTopologyNode, cancelTopologyNode) => {
  selection.classed('node', true);
  selection.append('circle')
    .attr('r', 10)
    .call(nodeDrag)
    .on('click', (d) => {
      chooseTopologyNode(d.index);
    })
    .on('dblclick', function(d) {
      cancelTopologyNode(d.index);
      d3.select(this).classed('fixed', d.fixed = false);
    });

  selection.append('text')
    .attr('x', 5)
    .attr('dy', '.35em')
    .text((d) => d.index);
};

const updateNode = (selection) => {
  setTimeout(() => {
    selection.attr('transform', d => {
      return `translate(${d.x},${d.y})`;
    });
  }, 0);
};

const enterLink = (selection) => {
  selection.classed('link', true)
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => Math.sqrt(d.value));
};

const updateLink = (selection) => {
  selection.attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
};

const updateGraph = (selection) => {
  selection.selectAll('.node')
    .call(updateNode);
  selection.selectAll('.link')
    .call(updateLink);
};

class Topology extends Component {

  componentDidMount() {
    this.props.initalTopology();
    this.d3Graph = d3.select(findDOMNode(this.refs.graph));
    force.on('tick', () => {
      this.d3Graph.call(updateGraph);
    });
  }
  shouldComponentUpdate(nextProps) {
    console.log("shouldComponentUpdate");

    if (nextProps.nodes.size === this.props.nodes.size &&
      nextProps.links.size === this.props.links.size) {
      return false;
    }

    const {
      nodes,
      links,
      chooseTopologyNode,
      cancelTopologyNode,
      updateTopology
    } = nextProps;
    const newNodes = nodes.toJS();
    const newLinks = links.toJS();
    this.d3Graph = d3.select(findDOMNode(this.refs.graph));

    const d3Nodes = this.d3Graph.selectAll('.node')
      .data(newNodes);
    d3Nodes.enter().append('g').call(enterNode, chooseTopologyNode, cancelTopologyNode);
    d3Nodes.exit().remove();
    d3Nodes.call(updateNode);

    const d3Links = this.d3Graph.selectAll('.link')
      .data(newLinks);
    d3Links.enter().insert('line', '.node').call(enterLink);
    d3Links.exit().remove();
    d3Links.call(updateLink);

    force.nodes(newNodes).links(newLinks);
    force.start();
    for (let i = 50000; i > 0; --i) force.tick();
    force.stop();
    // setTimeout(() => updateTopology({ nodes: newNodes, links: newLinks }), 0);

    return false;
  }

  render() {
    const style = {
      position: 'absolute',
      height: '89vh',
      width: '100vw',
      background: 'rgba(191, 191, 255, 0.5)',
    };
    return (
      <svg width={width} height={height} style={style}>
        <g ref="graph" />
      </svg>
    );
  }
}

Topology.propTypes = {
  chooseTopologyNode: PropTypes.func.isRequired,
};
export default Topology;
