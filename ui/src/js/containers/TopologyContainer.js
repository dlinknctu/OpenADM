import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Topology from '../components/Topology/Topology';
import {
  dragNode,
  clickNode,
  clickLink,
  selectNode,
  togglePanel,
} from '../actions/TopologyAction';
import { resetLayout } from '../actions/LayoutAction';
import { connectSocket } from '../actions/CoreAction';

const TopologyContainer = (props) => <Topology {...props} />;

const mapStateToProps = (state) => ({
  nodes: state.topology.nodes,
  links: state.topology.links,
  selectNodes: state.topology.selectNodes,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  dragNode,
  clickNode,
  clickLink,
  selectNode,
  togglePanel,
  resetLayout,
  connectSocket,
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(TopologyContainer);
