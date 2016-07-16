import React from 'react';
import { connect } from 'react-redux';
import Topology from '../components/Topology/Topology';

const TopologyContainer = (props) => <Topology {...props} />;

const mapStateToProps = (state) => ({
  nodes: state.topology.nodes,
  links: state.topology.links,
  selectNodes: state.topology.selectNodes,
});

const mapDispatchToProps = (dispatch) => ({
  dragNode: p => dispatch({ type: 'DRAG_NODE', payload: p }),
  clickNode: p => dispatch({ type: 'CLICK_NODE', payload: p }),
  clickLink: p => dispatch({ type: 'CLICK_LINK', payload: p }),
  selectNode: p => dispatch({ type: 'SELECT_NODE', payload: p }),
  togglePanel: p => dispatch({ type: 'TOGGLE_PANEL', payload: p }),
  resetLayout: () => dispatch({ type: 'RESET_LAYOUT', payload: {} }),
  search: p => dispatch({ type: 'SEARCH_NODE', payload: p }),
  tagChange: p => dispatch({ type: 'TAG_CHANGE', payload: p }),
  levelChange: p => dispatch({ type: 'LEVEL_CHANGE', payload: p }),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopologyContainer);
