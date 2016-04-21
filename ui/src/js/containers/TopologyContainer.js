import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Topology from '../components/Topology/Topology';
import * as TopologyAction from '../actions/TopologyAction';


const TopologyContainer = ({ topology, chooseTopologyNode }) => {
  const names = topology.get('selectNodes')
                        .map(data => `${data.get('name')},`);
  return (
  <div>
    <h2>You choose : {names}</h2>
    <Topology
      nodes={topology.get('nodes')}
      links={topology.get('links')}
      chooseTopologyNode={chooseTopologyNode }
    />
  </div>);
};

const mapStateToProps = (state) => ({
  topology: state.get('topology'),
});

const mapDispatchToProps = (dispatch) => ({
  chooseTopologyNode: (payload) => dispatch(TopologyAction.chooseTopologyNode(payload)),
});

TopologyContainer.propTypes = {
  topology: PropTypes.object.isRequired,
  chooseTopologyNode: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopologyContainer);
