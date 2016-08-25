import React, { PropTypes } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withHandlers } from 'recompose';
import {
  Table, TableBody, TableHeader, TableHeaderColumn,
  TableRow, TableRowColumn,
} from 'material-ui/Table';
import * as FlowActions from '../actions/FlowAction';
import FlowtableSetting from '../components/Flowtable/FlowtableSetting.jsx';
import Flowmod from '../components/Flowtable/Flowmod.jsx';
import FlowtableFilter from '../components/Flowtable/FlowtableFilter.jsx';
import FlowtableControl from '../components/Flowtable/FlowtableControl.jsx';

const filterManipulate = (row, filterRule) => {
  const data = row[filterRule.category];
  switch (filterRule.operator) {
    case '==':
      return data == filterRule.value;
    case '!=':
      return data != filterRule.value;
    case '>':
      return Number(data) > filterRule.value;
    case '<':
      return Number(data) < filterRule.value;
    case 'contains':
      return data.toString().includes(filterRule.value);
    case '!contains':
      return !data.toString().includes(filterRule.value);
    default:
      return false;

  }
};

const enhance = compose(
  withHandlers({
    handleSimulatePath: ({ simulatePath, selectedFlow }) => () => {
      simulatePath({
        controller: selectedFlow.controller,
        dpid: selectedFlow.dpid,
        flow: { ...selectedFlow },
      });
    },
  })
);
const Flowtable = enhance(({
  getAllFlow,
  showSetting,
  showColumn = [],
  showSearch,
  showAction,
  filters,
  flowlist = [],
  selectFlow,
  selectedFlow,
  addFilter,
  showColumnSetting,
  deleteFilter,
  handleSimulatePath,
  submiteFlowmod,
  toggleAction,
  toggleSearch,
  toggleSetting,
}) => {
  const display = flowlist.filter(row => {
    const result = filters.map(f => filterManipulate(row, f))
    .reduce((pre, cur) => pre.concat(cur), []);
    return result.every(d => d === true);
  });
  const header = (display.length !== 0) ? Object.keys(display[0]) : [];

  return (
    <div>
      <FlowtableSetting
        header={header}
        showSetting={showSetting}
        showColumn={showColumn}
        showColumnSetting={showColumnSetting}
        toggleSetting={toggleSetting}
      />
      <Flowmod
        field={display[0]}
        selectedFlow={selectedFlow}
        showAction={showAction}
        toggleAction={toggleAction}
        submiteFlowmod={submiteFlowmod}
      />
      <Table
        fixedHeader
        onRowSelection={(i) => selectFlow(display[i])}
        onCellClick={(a, b, c) => c.preventDefault()}
      >
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
         {(showSearch) ?
           <FlowtableFilter
             showColumn={showColumn}
             filters={filters}
             addFilter={addFilter}
             deleteFilter={deleteFilter}
             toggleSearch={toggleSearch}
           /> :
           <FlowtableControl
             getAllFlow={getAllFlow}
             showColumn={showColumn}
             simulatePath={handleSimulatePath}
             toggleAction={toggleAction}
             toggleSearch={toggleSearch}
             toggleSetting={toggleSetting}
           />
        }
        <TableRow>
          {showColumn.map((col, i) =>
            <TableHeaderColumn style={{ width: 100 }} key={i}>{col}</TableHeaderColumn>
          )}
        </TableRow>
        </TableHeader>
        <TableBody
          showRowHover
          preScanRows={false}
          displayRowCheckbox={false}
          deselectOnClickaway={false}
        >
         {display.map((row, i) => (
           <TableRow key={i}>
             {showColumn.map((col, j) =>
               <TableRowColumn style={{ width: 100 }} key={j}>{row[col]}</TableRowColumn>
             )}
           </TableRow>
         ))}
        </TableBody>
      </Table>
    </div>
  );
});

Flowtable.propTypes = {
  getAllFlow: PropTypes.func.isRequired,
  showColumn: PropTypes.array.isRequired,
  showSetting: PropTypes.bool.isRequired,
  showSearch: PropTypes.bool.isRequired,
  showAction: PropTypes.bool.isRequired,
  filters: PropTypes.array.isRequired,
  flowlist: PropTypes.array.isRequired,
  selectFlow: PropTypes.func.isRequired,
  selectedFlow: PropTypes.object,
  addFilter: PropTypes.func.isRequired,
  showColumnSetting: PropTypes.func.isRequired,
  deleteFilter: PropTypes.func.isRequired,
  simulatePath: PropTypes.func.isRequired,
  submiteFlowmod: PropTypes.func.isRequired,
  toggleAction: PropTypes.func.isRequired,
  toggleSearch: PropTypes.func.isRequired,
  toggleSetting: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => bindActionCreators(FlowActions, dispatch);

export default connect(s => s.flowtable, mapDispatchToProps)(Flowtable);
