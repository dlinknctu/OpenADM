import React, { PropTypes } from 'react';
import { TableHeaderColumn, TableRow } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import ReloadIcon from 'material-ui/svg-icons/action/autorenew';
import WidgetsIcon from 'material-ui/svg-icons/device/widgets';
import SettingIcon from 'material-ui/svg-icons/action/settings';
import SearchIcon from 'material-ui/svg-icons/action/search';
import SimulateIcon from 'material-ui/svg-icons/maps/transfer-within-a-station';

const iconStyle = {
  color: '#9e9e9e',
  hoverColor: 'black',
};

const FlowtableControl = ({
  showColumn,
  simulatePath,
  toggleAction,
  toggleSearch,
  toggleSetting,
  getAllFlow,
}) => (
  <TableRow>
    <TableHeaderColumn colSpan={1}>
      <h1>Flow table</h1>
    </TableHeaderColumn>
    <TableHeaderColumn
      style={{ textAlign: 'right' }}
      colSpan={showColumn.length - 1}
    >
      <IconButton
        tooltipPosition="bottom-left"
        tooltip="Reload flow"
        onClick={getAllFlow}
      >
        <ReloadIcon {...iconStyle} />
      </IconButton>
      <IconButton
        tooltipPosition="bottom-left"
        tooltip="Path simulate"
        onClick={simulatePath}
      >
        <SimulateIcon {...iconStyle} />
      </IconButton>
      <IconButton
        tooltipPosition="bottom-left"
        tooltip="Flow modify"
        onClick={toggleAction}
      >
        <WidgetsIcon {...iconStyle} />
      </IconButton>
      <IconButton
        tooltipPosition="bottom-left"
        tooltip="Search"
        onClick={toggleSearch}
      >
        <SearchIcon {...iconStyle} />
      </IconButton>
      <IconButton
        tooltipPosition="bottom-left"
        tooltip="Setting Flowtable"
        onClick={toggleSetting}
      >
        <SettingIcon {...iconStyle} />
      </IconButton>
    </TableHeaderColumn>
  </TableRow>
);

FlowtableControl.propTypes = {
  getAllFlow: PropTypes.func.isRequired,
  showColumn: PropTypes.array.isRequired,
  simulatePath: PropTypes.func.isRequired,
  toggleAction: PropTypes.func.isRequired,
  toggleSearch: PropTypes.func.isRequired,
  toggleSetting: PropTypes.func.isRequired,
};

export default FlowtableControl;
