/**
 * Master Component
 * the root component
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import LeftNavBar from './components/LeftNavBar.jsx';
import AppBar from 'material-ui/AppBar';
import AppCanvas from 'material-ui/internal/AppCanvas';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Theme from '../theme.js';
import { resetLayout } from './actions/LayoutAction';

const styles = {
  paddingTop: '64px',
  paddingRight: '0px',
  paddingBottom: '0px',
  paddingLeft: '0px',
  height: '92vh',
};

class Master extends React.Component {

  constructor(props) {
    super(props);
    this.onLeftIconButtonTouchTap = this.onLeftIconButtonTouchTap.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme(Theme),
    };
  }

  onLeftIconButtonTouchTap() {
    this.refs.leftNav.handleToggle();
  }

  handleReset() {
    this.props.resetLayout();
  }

  render() {
    return (
      <AppCanvas>
        <AppBar
          title="OpenADM"
          iconElementRight={<FlatButton onClick={this.handleReset} label="Reset layout" />}
          onLeftIconButtonTouchTap={this.onLeftIconButtonTouchTap}
        />
        <LeftNavBar ref="leftNav" />
        <div style={styles}>
          {this.props.children}
        </div>
      </AppCanvas>
      );
  }
}

Master.propTypes = {
  children: PropTypes.object.isRequired,
};

Master.childContextTypes = {
  muiTheme: PropTypes.object,
};

const mapDispatchToProps = (dispatch) => ({
  resetLayout: () => dispatch(resetLayout()),
});

export default connect(null, mapDispatchToProps)(Master);
