import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import d3 from 'd3';
import mock from './mockdata';
import './topology.less';

// *****************************************************
// ** d3 functions to manipulate attributes
// *****************************************************

const enterNode = (selection) => {
  selection.classed('node', true);
  selection.append('circle')
    .attr('r', (d) => d.size)
    .call(this.force.drag);

  selection.append('text')
    .attr('x', (d) => d.size + 5)
    .attr('dy', '.35em')
    .text((d) => d.key);
};

const updateNode = (selection) => {
  selection.attr('transform', d => `translate(${d.x},${d.y})`);
};

const enterLink = (selection) => {
  selection.classed('link', true)
    .attr('stroke-width', d => d.size);
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

const color = d3.scale.category20();
class Topology extends Component {

  componentDidMount() {
    const svg = d3.select(this.refs.mount)
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);
    const force = d3.layout
      .force()
      .charge(-120)
      .size([500, 500])
      .linkDistance(50)
      .nodes(mock.nodes)
      .links(mock.links);
    const link = svg.selectAll('line')
      .data(mock.links)
      .enter()
        .append('line')
        .style('stroke', '#999')
        .style('stroke-opacity', 0.6)
        .style('stroke-width', d => Math.sqrt(d.value));

    const node = svg.selectAll('circle')
      .data(mock.nodes)
      .enter()
        .append('circle')
        .attr('r', 5)
        .style('stroke', '#FFFFFF')
        .style('stroke-width', 1.5)
        .style('fill', (d) => color(d.group) )
        .on('click', d => { this.props.chooseTopologyNode(d) })
        .on('dblclick', function(d){ d3.select(this).classed('fixed', d.fixed = false) })
        .call(
          force
            .drag()
            .on('dragstart', function(d){ d3.select(this).classed('fixed', d.fixed = true)} )
        );

    force.on('tick', () => {
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    });
    force.start();
    for (let i = 10000; i > 0; --i) force.tick();
    force.stop();
    this.force = force;
  }

  shouldComponentUpdate(nextProps) {
    this.d3Graph = d3.select(findDOMNode(this.refs.mount));

    const d3Nodes = this.d3Graph.selectAll('.node')
      .data(nextProps.nodes, (node) => node.key);
    d3Nodes.enter().append('g').call(enterNode);
    d3Nodes.exit().remove();
    d3Nodes.call(updateNode);

    const d3Links = this.d3Graph.selectAll('.link')
      .data(nextProps.links, (link) => link.key);
    d3Links.enter().insert('line', '.node').call(enterLink);
    d3Links.exit().remove();
    d3Links.call(updateLink);

    this.force.nodes(nextProps.nodes).links(nextProps.links);
    this.force.start();

    return false;
  }

  render() {
    return (
      <div ref="mount">
      </div>
    );
  }
}

Topology.propTypes = {
  chooseTopologyNode: PropTypes.func.isRequired,
};
export default Topology;
