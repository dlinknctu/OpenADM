import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
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
import { togglePanel } from '../actions/LayoutAction';

import { settingController } from '../actions/CoreAction';

const DomainContainer = ({
  hiddenPanel,
  subscribe,
  handleSettingController,
  handleTogglePanel,
}) => (
  <div>
    <TopologyContainer />
    <ModuleContainer>
      <FlowtableContainer />
      <ControllerContainer />
      <PortStatusContainer />
      <SettingController settingController={handleSettingController} subscribe={subscribe} />
    </ModuleContainer>
    <ModuleButton hiddenPanel={hiddenPanel} togglePanel={handleTogglePanel} />
  </div>
);

DomainContainer.propTypes = {
  hiddenPanel: PropTypes.array,
  subscribe: PropTypes.func,
  handleSettingController: PropTypes.func,
  handleTogglePanel: PropTypes.func,
};

const mapStateToProps = state => ({
  hiddenPanel: state.layout.hiddenPanel,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  handleTogglePanel: togglePanel,
  handleSettingController: settingController,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DomainContainer);
