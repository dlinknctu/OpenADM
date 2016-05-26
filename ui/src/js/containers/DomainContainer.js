import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ModuleContainer from './ModuleContainer';
import TopologyContainer from './TopologyContainer';

const Flowtable = () => <h1>flowtable</h1>;
const ControllerStatus = () => <h1>Controller Status</h1>;
const PortStatus = () => <h1>PortStatus Status</h1>;

class DomainContainer extends Component {

  render() {
    return (
      <div style={{ overflow: 'hidden' }}>
        <TopologyContainer />
        <ModuleContainer>
          <Flowtable />
          <ControllerStatus />
          <PortStatus />
        </ModuleContainer>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  hiddenPanel: state.layout.hiddenPanel,
});

export default connect(mapStateToProps)(DomainContainer);
