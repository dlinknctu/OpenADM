import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/lib/paper';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
const GridLayout = WidthProvider(ReactGridLayout);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { layoutChange } from '../actions/LayoutAction';
import ModuleContainer from './ModuleContainer';
import TopologyContainer from './TopologyContainer';

const Flowtable = () => <h1>flowtable</h1>;
const ControllerStatus = () => <h1>Controller Status</h1>;

class DomainContainer extends Component {
  constructor(props) {
    super(props);
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  onLayoutChange(layout) {
    this.props.dispatch(layoutChange(layout));
  }

  render() {
    return (
      <div>
        <TopologyContainer />
        <ModuleContainer>
          <Flowtable />
          <ControllerStatus />
        </ModuleContainer>
      </div>
    );
  }
}


const mapStateToProps = (state) => ({
  layout: state.get("layout"),
});

export default connect(mapStateToProps)(DomainContainer);
