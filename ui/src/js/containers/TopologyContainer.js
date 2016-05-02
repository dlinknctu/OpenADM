import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Topology from '../components/Topology/Topology';
import * as TopologyAction from '../actions/TopologyAction';

const TopologyContainer = ({
  nodes,
  links,
  selectNodes,
  chooseTopologyNode,
  cancelTopologyNode,
  updateTopology,
  getMockData,
}) => {
  return (
    <div>
      <Topology
        initalTopology={getMockData}
        nodes={nodes}
        links={links}
        chooseTopologyNode={chooseTopologyNode}
        cancelTopologyNode={cancelTopologyNode}
        updateTopology={updateTopology}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  nodes: state.getIn(['topology', 'nodes']),
  links: state.getIn(['topology', 'links']),
  selectNodes: state.getIn(['topology', 'selectNodes']),
});

const mapDispatchToProps = (dispatch) => ({
  chooseTopologyNode: (payload) => dispatch(TopologyAction.chooseTopologyNode(payload)),
  cancelTopologyNode: (payload) => dispatch(TopologyAction.cancelTopologyNode(payload)),
  updateTopology: (payload) => dispatch(TopologyAction.updateTopology(payload)),
  getMockData: () => dispatch({ type: 'GET_MOCK_DATA', payload: null }),
});

TopologyContainer.propTypes = {
  nodes: PropTypes.object.isRequired,
  links: PropTypes.object.isRequired,
  selectNodes: PropTypes.object.isRequired,
  chooseTopologyNode: PropTypes.func.isRequired,
  cancelTopologyNode: PropTypes.func.isRequired,
  updateTopology: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(TopologyContainer);
