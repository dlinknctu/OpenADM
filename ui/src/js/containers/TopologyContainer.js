import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Topology from '../components/Topology/Topology';
import * as TopologyAction from '../actions/TopologyAction';

class TopologyContainer extends Component {
  componentDidMount() {
    // setTimeout(() => {
    //   this.props.subscribe();
    // }, 2000);
    // setTimeout(() => {
    //   this.props.flowtop();
    // }, 4000);
    // setTimeout(() => {
    //   this.props.flowall();
    // }, 6000);
  }
  render() {
    return <Topology {...this.props} />;
  }
}

const mapStateToProps = (state) => ({
  nodes: state.topology.nodes,
  links: state.topology.links,
  selectNodes: state.topology.selectNodes,
});

const mapDispatchToProps = (dispatch) => ({
  updateNode: p => dispatch({ type: 'UPDATE_NODE', payload: p }),
  addNode: p => dispatch({ type: 'ADD_NODE', payload: p }),
  delNode: p => dispatch({ type: 'DEL_NODE', payload: p }),
  addLink: p => dispatch({ type: 'ADD_LINK', payload: p }),
  delLink: p => dispatch({ type: 'DEL_LINK', payload: p }),
  search: p => dispatch({ type: 'SEARCH_NODE', payload: p }),
  tagChange: p => dispatch({ type: 'TAG_CHANGE', payload: p }),
  levelChange: p => dispatch({ type: 'LEVEL_CHANGE', payload: p }),
  subscribe: p => dispatch({ type: 'SUBSCRIBE', payload: p }),
  flowtop: p => dispatch({ type: 'OTHER', payload: { 'url': 'flow/top', request: '{}' } }),
  flowall: p => dispatch({ type: 'OTHER', payload: { 'url': 'flow', request: '{}' } }),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopologyContainer);
