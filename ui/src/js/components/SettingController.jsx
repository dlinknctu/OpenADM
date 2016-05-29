import React, { PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import PaperPanel from './PaperPanel.jsx';
import SendIcon from 'material-ui/svg-icons/content/send';
import SettingIcon from 'material-ui/svg-icons/action/settings-applications';
import DonutIcon from 'material-ui/svg-icons/action/donut-large';
import PermIcon from 'material-ui/svg-icons/action/perm-identity';

const styles = {
  panelBtn: {
    marginLeft: 'auto',
    display: 'block',
    width: '130px',
  },
  textIcon: {
    padding: '0 20 0 0',
    verticalAlign: 'middle',
  },
};

const SettingController = ({ settingController }) => {
  console.log('SettingController', SettingController);
  return (
    <div>
      <div>
        <SettingIcon style={styles.textIcon} />
        <TextField hintText="http://ip:port" floatingLabelText="Core URL" />
      </div>
      <div>
        <DonutIcon style={styles.textIcon} />
        <TextField hintText="http://ip:port" floatingLabelText="Controller URL" />
      </div>
      <div>
        <PermIcon style={styles.textIcon} />
        <TextField floatingLabelText="Custom Controller Name" />
      </div>
      <RaisedButton
        style={styles.panelBtn}
        label="Setting" primary labelPosition="before" icon={<SendIcon />}
        onClick={settingController}
      />
    </div>
  );
};

SettingController.propTypes = {
  settingController: PropTypes.func.isRequired,
};

export default SettingController;
