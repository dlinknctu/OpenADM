import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ModuleContainer from './ModuleContainer';
import TopologyContainer from './TopologyContainer';
import ControllerContainer from './ControllerContainer';
import ModuleButton from '../components/ModuleButton.jsx';
import SettingController from '../components/SettingController.jsx';
import TextField from 'material-ui/TextField';
const Flowtable = () => <div>
  <h1 style={{ color: 'rgb(228,10,93)'}}>Flowtable</h1>
  <TextField hintText="Hint Text" />
</div>;
const PortStatus = () => <div>
  <h1>PortStatus Status</h1>
</div>;

class DomainContainer extends Component {
  render() {
    const { hiddenPanel, settingController, subscribe, togglePanel } = this.props;
    return (
      <div>
        <TopologyContainer />
        <ModuleContainer>
          <Flowtable />
          <ControllerContainer />
          <PortStatus />
          <SettingController settingController={settingController} subscribe={subscribe} />
        </ModuleContainer>
        <ModuleButton hiddenPanel={hiddenPanel} togglePanel={togglePanel} />
      </div>
    );
  }
}


const mapStateToProps = state => ({
  hiddenPanel: state.layout.hiddenPanel,
});

const mapDispatchToProps = dispatch => ({
  togglePanel: p => dispatch({ type: 'TOGGLE_PANEL', payload: p }),
  settingController: p => dispatch({ type: 'SETTING_CONTROLLER', payload: p }),
  subscribe: () => dispatch({ type: 'SUBSCRIBE', payload: {} }),
});

export default connect(mapStateToProps, mapDispatchToProps)(DomainContainer);
