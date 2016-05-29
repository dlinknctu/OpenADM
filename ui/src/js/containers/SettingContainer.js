import React from 'react';
import { connect } from 'react-redux';
import { withHandlers, onlyUpdateForKeys, compose } from 'recompose';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import PaperPanel from '../components/PaperPanel.jsx';
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

const NameTextField = onlyUpdateForKeys(['value'])(
  ({ value, changeName }) => (
    <div>
      <TextField
        id="textField"
        value={value}
        onChange={(e) => changeName(e.target.value)}
      />
    </div>
  )
);

const counterIncrease = (payload = 5) => ({
  type: 'COUNTER_INCREASE',
  payload,
});

const counterDecrease = (payload = 3) => ({
  type: 'COUNTER_DECREASE',
  payload,
});

const changeName = (name) => ({
  type: 'CHANGE_NAME',
  payload: name,
});

const mapStateToProps = (state) => ({
  counter: state.counter,
});

const mapDispatchToProps = (dispatch) => ({
  changeName: (payload) => dispatch(changeName(payload)),
  increase: (payload) => dispatch(counterIncrease(payload)),
  decrease: (payload) => dispatch(counterDecrease(payload)),
});

const SettingContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withHandlers({
    handleIncrease: ({ increase }) => () => increase(5),
    handleDecrease: ({ decrease }) => () => decrease(3),
  })
)((props) => (
  <div>
    <h1>Setting</h1>
    <PaperPanel>
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
      />
    </PaperPanel>

    {/*<RaisedButton label="增加" secondary onClick={props.handleIncrease} />
    <RaisedButton label="減少" primary onClick={props.handleDecrease} />
    <NameTextField value={props.counter.name} changeName={props.changeName} />
    <h4>name: {props.counter.name}</h4>
    <h4>count: {props.counter.count}</h4>*/}
    <pre>{JSON.stringify(props, undefined, 2)}</pre>
  </div>
  )
);

export default SettingContainer;
