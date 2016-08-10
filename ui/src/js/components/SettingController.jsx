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
    marginLeft: '180px',
  },
  textIcon: {
    padding: '0 20 0 0',
    verticalAlign: 'middle',
  },
};

const enhance = compose(
  withState('coreURL', 'setCoreURL', ({ setting }) => setting.coreURL),
  withState('controllerURL', 'setControllerURL', ({ setting }) => setting.controllerURL),
  withState('controllerName', 'setControllerName', ({ setting }) => setting.controllerName),
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
  coreURL,
  controllerURL,
  controllerName,
  onCoreURLChange,
  onControllerURLChange,
  onControllerNameChange,
  onSubmit,
}) => (
  <div>
    <h2 style={{ marginBottom: '0px' }}>Controller Setting</h2>
    <div>
      <SettingIcon style={styles.textIcon} />
      <TextField
        hintText="http://ip:port"
        floatingLabelText="Core URL"
        onChange={onCoreURLChange}
        defaultValue={coreURL}
      />
    </div>
    <div>
      <DonutIcon style={styles.textIcon} />
      <TextField
        hintText="http://ip:port"
        floatingLabelText="Controller Adapter URL"
        onChange={onControllerURLChange}
        defaultValue={controllerURL}
      />
    </div>
    <div>
      <PermIcon style={styles.textIcon} />
      <TextField
        floatingLabelText="Custom Controller Name"
        onChange={onControllerNameChange}
        defaultValue={controllerName}
      />
    </div>
    <div>
      <RaisedButton
        style={styles.panelBtn}
        label="Setting"
        primary labelPosition="before"
        icon={<SendIcon />}
        onClick={onSubmit}
      />
    </div>
  </div>
);

SettingController.propTypes = {
  setting: PropTypes.object.isRequired,
  coreURL: PropTypes.string.isRequired,
  controllerURL: PropTypes.string.isRequired,
  controllerName: PropTypes.string.isRequired,
  onCoreURLChange: PropTypes.func.isRequired,
  onControllerURLChange: PropTypes.func.isRequired,
  onControllerNameChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default enhance(SettingController);
