import React, { PropTypes } from 'react';
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

const DomainContainer = ({
  hiddenPanel,
  settingController,
  subscribe,
  togglePanel,
}) => (
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


const mapStateToProps = state => ({
  hiddenPanel: state.layout.hiddenPanel,
});

const mapDispatchToProps = dispatch => ({
  togglePanel: p => dispatch({ type: 'TOGGLE_PANEL', payload: p }),
  settingController: p => dispatch({ type: 'SETTING_CONTROLLER', payload: p }),
});

DomainContainer.propTypes = {
  hiddenPanel: PropTypes.array,
  settingController: PropTypes.func,
  subscribe: PropTypes.func,
  togglePanel: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(DomainContainer);
