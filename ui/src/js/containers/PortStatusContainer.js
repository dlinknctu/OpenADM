import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import ReloadIcon from 'material-ui/svg-icons/action/autorenew';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';

const iconStyle = {
  color: '#9e9e9e',
  hoverColor: 'black',
};

const PortStatusContainer = ({ portStatus, getPorts }) => (
  <div>
    <h2>Port Status</h2>
    <IconButton
      tooltipPosition="bottom-left"
      tooltip="Reload Port Status"
      onClick={getPorts}
      style={{ top: 30, right: 30, position: 'absolute' }}
    >
      <ReloadIcon {...iconStyle} />
    </IconButton>
    <Table selectable={false} fixedHeader>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn style={{ width: '15%' }}>controller</TableHeaderColumn>
          <TableHeaderColumn style={{ width: '20%' }}>dpid</TableHeaderColumn>
          <TableHeaderColumn style={{ width: '10%' }}>port</TableHeaderColumn>
          <TableHeaderColumn style={{ width: '11%' }}>txbyte</TableHeaderColumn>
          <TableHeaderColumn style={{ width: '11%' }}>rxbyte</TableHeaderColumn>
          <TableHeaderColumn style={{ width: '11%' }}>rxpacket</TableHeaderColumn>
          <TableHeaderColumn style={{ width: '11%' }}>txpacket</TableHeaderColumn>
          <TableHeaderColumn style={{ width: '11%' }}>capacity</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
      {portStatus.map((d, i) =>
        <TableRow key={`row-${i}`}>
          <TableRowColumn style={{ width: '15%', whiteSpace: 'pre', textOverflow: 'clip' }}>
            {d.controller}
          </TableRowColumn>
          <TableRowColumn style={{ width: '20%', whiteSpace: 'pre', textOverflow: 'clip' }}>
            {d.dpid}
          </TableRowColumn>
          <TableRowColumn style={{ width: '10%', whiteSpace: 'pre', textOverflow: 'clip' }}>
            {d.port}
          </TableRowColumn>
          <TableRowColumn style={{ width: '11%', whiteSpace: 'pre', textOverflow: 'clip' }}>
            {d.txbyte}
          </TableRowColumn>
          <TableRowColumn style={{ width: '11%', whiteSpace: 'pre', textOverflow: 'clip' }}>
            {d.rxbyte}
          </TableRowColumn>
          <TableRowColumn style={{ width: '11%', whiteSpace: 'pre', textOverflow: 'clip' }}>
            {d.rxpacket}
          </TableRowColumn>
          <TableRowColumn style={{ width: '11%', whiteSpace: 'pre', textOverflow: 'clip' }}>
            {d.txpacket}
          </TableRowColumn>
          <TableRowColumn style={{ width: '11%', whiteSpace: 'pre', textOverflow: 'clip' }}>
            {d.capacity}
          </TableRowColumn>
        </TableRow>
      )}
      </TableBody>
    </Table>
  </div>
);

PortStatusContainer.propTypes = {
  portStatus: PropTypes.array,
  getPorts: PropTypes.func,
};

const mapStateToProps = state => ({
  portStatus: state.portStatus,
});

const mapDispatchToProps = dispatch => ({
  getPorts: () => dispatch({
    type: 'OTHER',
    payload: {
      url: 'port',
    },
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(PortStatusContainer);
