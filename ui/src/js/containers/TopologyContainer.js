import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Topology from '../components/Topology/Topology';
import * as TopologyAction from '../actions/TopologyAction';

class TopologyContainer extends Component {
  render() {
    return (
      <div>
        <Topology
          {...this.props}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  nodes: state.topology.nodes,
  links: state.topology.links,
  selectNodes: state.topology.selectNodes,
});

const mapDispatchToProps = (dispatch) => ({
  getMockData: () => dispatch({ type: 'GET_MOCK_DATA', payload: null }),
  updateNode: p => dispatch({ type: 'UPDATE_NODE', payload: p }),
  addNode: p => dispatch({ type: 'ADD_NODE', payload: p }),
  delNode: p => dispatch({ type: 'DEL_NODE', payload: p }),
  addLink: p => dispatch({ type: 'ADD_LINK', payload: p }),
  delLink: p => dispatch({ type: 'DEL_LINK', payload: p }),
  search: p => dispatch({ type: 'SEARCH_NODE', payload: p }),
  tagChange: p => dispatch({ type: 'TAG_CHANGE', payload: p }),
  levelChange: p => dispatch({ type: 'LEVEL_CHANGE', payload: p }),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopologyContainer);
