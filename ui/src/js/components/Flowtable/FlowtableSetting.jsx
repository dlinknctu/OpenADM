import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import { onlyUpdateForKeys } from 'recompose';

const SettingStyle = {
  style: { float: 'left', width: '20%', margin: 5 },
  iconStyle: { marginRight: 0 },
};

const SettingCheckbox = onlyUpdateForKeys(['field', 'showColumn'])(
  ({ field, showColumn, showColumnSetting }) => <Checkbox
    {...SettingStyle}
    label={field}
    checked={(showColumn.indexOf(field) !== -1)}
    onCheck={(a, checked) => showColumnSetting({
      value: field,
      checked,
    })}
  />
);

const FlowtableSetting = ({
  header,
  showColumn,
  showSetting,
  showColumnSetting,
  toggleSetting,
}) => (
  <Dialog
    title="Setting the show column"
    actions={[<RaisedButton label="Close" primary={true} onClick={toggleSetting} />]}
    open={showSetting}
  >
    <div style={{ display: 'table' }}>
      {header.map((d, i) => <SettingCheckbox
        key={`ch-${i}`}
        field={d}
        showColumn={showColumn}
        showColumnSetting={showColumnSetting}
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
