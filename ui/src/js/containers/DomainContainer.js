import React, { Component, PropTypes } from 'react';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import Paper from 'material-ui/lib/paper';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
const GridLayout = WidthProvider(ReactGridLayout);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { layoutChange } from '../actions/LayoutAction';
import ModuleContainer from './ModuleContainer';

const Topology = () => <h1>topology</h1>;
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
        <h1>Domain {this.props.domainName}</h1>
        <Topology />
        <ModuleContainer>
          <Flowtable />
          <ControllerStatus />
        </ModuleContainer>
        <pre>{JSON.stringify(this.props, undefined, 2)}</pre>
      </div>
    );
  }
}


const mapStateToProps = (state) => ({
  layout: state.get("layout"),
});

export default connect(mapStateToProps)(DomainContainer);
