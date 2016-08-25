import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';

const SettingStyle = {
  style: { float: 'left', width: '20%', margin: 5 },
  iconStyle: { marginRight: 0 },
}

const FlowtableSetting = ({ header, showColumn, showSetting, showColumnSetting, toggleSetting }) => (
  <Dialog
    title="Setting the show column"
    actions={[<RaisedButton label="Close" primary={true} onTouchTap={toggleSetting} />]}
    open={showSetting}
  >
    <div style={{ display: 'table' }}>
      {header.map((d, i) => <Checkbox
        {...SettingStyle}
        key={`ch-${i}`}
        label={d}
        checked={(showColumn.indexOf(d) != -1)}
        onCheck={(a ,checked) => showColumnSetting({
          value: d,
          checked,
        })}
      />)}
    </div>
  </Dialog>
);

FlowtableSetting.propTypes = {
  header: PropTypes.array.isRequired,
  showColumn: PropTypes.array.isRequired,
  showSetting: PropTypes.bool.isRequired,
  showColumnSetting: PropTypes.func.isRequired,
  toggleSetting: PropTypes.func.isRequired,
};

export default FlowtableSetting;
