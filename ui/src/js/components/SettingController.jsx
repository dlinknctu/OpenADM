import React, { PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SendIcon from 'material-ui/svg-icons/content/send';
import SettingIcon from 'material-ui/svg-icons/action/settings-applications';
import DonutIcon from 'material-ui/svg-icons/action/donut-large';
import PermIcon from 'material-ui/svg-icons/action/perm-identity';
import { withHandlers, withState, compose } from 'recompose';

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

const enhance = compose(
  withState('coreURL', 'setCoreURL', ''),
  withState('controllerURL', 'setControllerURL', ''),
  withState('controllerName', 'setControllerName', ''),
  withHandlers({
    onCoreURLChange: props => event => {
      props.setCoreURL(event.target.value);
    },
    onControllerURLChange: props => event => {
      props.setControllerURL(event.target.value);
    },
    onControllerNameChange: props => event => {
      props.setControllerName(event.target.value);
    },
    onSubmit: ({ coreURL, controllerURL, controllerName, settingController }) =>
    event => {
      event.preventDefault();
      settingController({
        coreURL,
        controllerURL,
        controllerName,
      });
    },
  })
);
const SettingController = ({
  onCoreURLChange,
  onControllerURLChange,
  onControllerNameChange,
  onSubmit,
}) => (
  <div>
    <div>
      <SettingIcon style={styles.textIcon} />
      <TextField
        hintText="http://ip:port"
        floatingLabelText="Core URL"
        onChange={onCoreURLChange}
      />
    </div>
    <div>
      <DonutIcon style={styles.textIcon} />
      <TextField
        hintText="http://ip:port"
        floatingLabelText="Controller URL"
        onChange={onControllerURLChange}
      />
    </div>
    <div>
      <PermIcon style={styles.textIcon} />
      <TextField
        floatingLabelText="Custom Controller Name"
        onChange={onControllerNameChange}
      />
    </div>
    <RaisedButton
      style={styles.panelBtn}
      label="Setting"
      primary labelPosition="before"
      icon={<SendIcon />}
      onClick={onSubmit}
    />
  </div>
);

SettingController.propTypes = {
  onCoreURLChange: PropTypes.func.isRequired,
  onControllerURLChange: PropTypes.func.isRequired,
  onControllerNameChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default enhance(SettingController);
