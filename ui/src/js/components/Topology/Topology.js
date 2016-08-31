import React, { PropTypes, Component } from 'react';
import { findDOMNode } from 'react-dom';
import topo from './Topo.js';
import './topology.css';

class Topology extends Component {

  componentDidMount() {
    const renderDom = findDOMNode(this.refs.topology);
    topo.initalTopo(renderDom);
    topo.bindEvent(this.props);
    this.props.connectSocket();
  }
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div ref="topology" className="topology"></div>;
  }
}

Topology.propTypes = {
  connectSocket: PropTypes.func.isRequired,
};
export default Topology;
