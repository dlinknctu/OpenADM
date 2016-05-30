import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ModuleContainer from './ModuleContainer';
import TopologyContainer from './TopologyContainer';
import FlowtableContainer from './FlowtableContainer';
import ControllerContainer from './ControllerContainer';
import ModuleButton from '../components/ModuleButton.jsx';
import SettingController from '../components/SettingController.jsx';
import PortStatusContainer from './PortStatusContainer';

class DomainContainer extends Component {
  render() {
    const { hiddenPanel, settingController, subscribe, togglePanel } = this.props;
    return (
      <div>
        <TopologyContainer />
        <ModuleContainer>
          <FlowtableContainer />
          <ControllerContainer />
          <PortStatusContainer />
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
});

export default connect(mapStateToProps, mapDispatchToProps)(DomainContainer);
