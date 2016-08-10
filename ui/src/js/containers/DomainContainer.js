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
import SettingContainer from './SettingContainer.js';
import PortStatusContainer from './PortStatusContainer';
import { togglePanel } from '../actions/LayoutAction';

const DomainContainer = ({
  hiddenPanel,
  handleTogglePanel,
}) => (
  <div>
    <TopologyContainer />
    <ModuleContainer>
      <FlowtableContainer />
      <ControllerContainer />
      <PortStatusContainer />
      <SettingContainer />
    </ModuleContainer>
    <ModuleButton hiddenPanel={hiddenPanel} togglePanel={handleTogglePanel} />
  </div>
);

DomainContainer.propTypes = {
  hiddenPanel: PropTypes.array,
  handleTogglePanel: PropTypes.func,
};

const mapStateToProps = state => ({
  hiddenPanel: state.layout.hiddenPanel,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  handleTogglePanel: togglePanel,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DomainContainer);
