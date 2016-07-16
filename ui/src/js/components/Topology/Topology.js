import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import topo from './Topo.js';
import styles from './topology.css';

class Toplogy extends Component {

  componentDidMount() {
    const renderDom = findDOMNode(this.refs.topology);
    topo.initalTopo(renderDom);
    topo.bindEvent(this.props);
  }
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div ref="topology" className={styles.topology}></div>;
  }
}

export default Toplogy;
