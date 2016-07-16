import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Griddle from 'griddle-react';
import { withHandlers } from 'recompose';
import * as Actions from '../actions/TopologyAction';
import Flowmod from '../components/Flowmod';
import IconButton from 'material-ui/IconButton';
import RenewIcon from 'material-ui/svg-icons/action/autorenew';

const styles = {
  large: {
    width: 120,
    height: 120,
    padding: 30,
    right: '20px',
    top: '0px',
    marginRight: '25px',
    position: 'absolute',
  },
  largeIcon: {
    width: 60,
    height: 60,
  },
};

const enhance = withHandlers({
  handleGetAllFlow: ({ getAllFlow }) =>
    ({ controller, dpid }) =>
      getAllFlow({ controller, dpid }),
  handleSimulate: ({ selectNode, selectFlow, simulate }) => () => {
    const payload = {
      controller: selectNode.controller,
      dpid: selectNode.dpid,
      flow: selectFlow,
    };
    simulate(payload);
  },
  onRowClick: ({ flowtableClick }) => (row) => flowtableClick(row.props.data),
});

const FlowtableContainer = ({
  flowlist,
  handleSimulate,
  selectFlow,
  selectNode,
  flowmode,
  handleGetAllFlow,
  canelSelectFlow,
  onRowClick,
}) => (
  <div>
    <h2>Flowtable: {selectNode.uid}</h2>
    <IconButton
      iconStyle={styles.largeIcon}
      style={styles.large}
      onClick={() => handleGetAllFlow(selectNode)}
    >
      <RenewIcon color={'green'} hoverColor={'red'} />
    </IconButton>
    <Flowmod
      isOpen={Boolean(selectFlow.srcIP)}
      canelSelectFlow={canelSelectFlow}
      flowmode={flowmode}
      selectNode={selectNode}
      handleSimulate={handleSimulate}
    />
    <div className="griddle-container">
      <Griddle
        results={flowlist}
        tableClassName="table"
        showFilter
        showSettings
        enableInfiniteScroll
        useFixedHeader
        bodyHeight={200}
        columns={['srcIP', 'dstIP', 'dstMac', 'dstPort']}
        onRowClick={onRowClick}
      />
    </div>
  </div>
);


const filterFlowList = (flowlist) => {
  if (flowlist.length) {
    return flowlist
    .reduce((previous, current) => previous.concat(
      current.flows
        .map(flow => ({
          ...flow,
          actions: JSON.stringify(flow.actions),
        }))
    ), []);
  }
  return flowlist.flows.map(flow => ({
    ...flow,
    actions: JSON.stringify(flow.actions),
  }));
};

const mapStateToProps = state => ({
  selectNode: state.topology.selectNodes,
  filterString: state.flowtable.filterString,
  visibleField: state.flowtable.visibleField,
  selectFlow: state.flowtable.selectFlow,
  flowlist: filterFlowList(state.flowtable.flowlist),
});

const mapDispatchToProps = dispatch => ({
  getAllFlow: payload => dispatch(Actions.getAllFlow(payload)),
  simulate: payload => dispatch(Actions.simulate(payload)),
  flowmode: (payload) => dispatch({
    type: 'FLOWMODE',
    payload,
  }),
  canelSelectFlow: () => dispatch({
    type: 'FLOWTABLE_CLICK',
    payload: {},
  }),
  flowtableClick: (payload) => dispatch({
    type: 'FLOWTABLE_CLICK',
    payload,
  }),
});

FlowtableContainer.propTypes = {
  flowlist: PropTypes.array.isRequired,
  selectFlow: PropTypes.object.isRequired,
  selectNode: PropTypes.object.isRequired,
  flowtableClick: PropTypes.func.isRequired,
  simulate: PropTypes.func.isRequired,
  flowmode: PropTypes.func.isRequired,
  handleGetAllFlow: PropTypes.func.isRequired,
  handleSimulate: PropTypes.func.isRequired,
  canelSelectFlow: PropTypes.func.isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(enhance(FlowtableContainer));
