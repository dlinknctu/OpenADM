import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ModuleContainer from './ModuleContainer';
import TopologyContainer from './TopologyContainer';
import ModuleButton from '../components/ModuleButton.jsx';

const Flowtable = () => <div>
  <h1>Flowtable</h1>
</div>;
const ControllerStatus = () => <div>
  <h1>Controller Status</h1>
</div>;
const PortStatus = () => <div>
  <h1>PortStatus Status</h1>
</div>;

class DomainContainer extends Component {

  render() {
    return (
      <div>
        <TopologyContainer />
        <ModuleContainer>
          <Flowtable />
          <ControllerStatus />
          <PortStatus />
        </ModuleContainer>
        <ModuleButton {...this.props} />
      </div>
    );
  }
}


const mapStateToProps = state => ({
  hiddenPanel: state.layout.hiddenPanel,
});

const mapDispatchToProps = dispatch => ({
  togglePanel: p => dispatch({ type: 'TOGGLE_PANEL', payload: p }),
});

export default connect(mapStateToProps, mapDispatchToProps)(DomainContainer);
