/**
 * Master Component
 * the root component
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import LeftNavBar from './components/LeftNavBar.jsx';
import AppBar from 'material-ui/lib/app-bar';
import AppCanvas from 'material-ui/lib/app-canvas';
import FlatButton from 'material-ui/lib/flat-button';
import FullWidthSection from './components/FullWidthSection.jsx';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import Theme from '../theme.js';
import { resetLayout } from './actions/LayoutAction';

class Master extends React.Component {

  constructor(props) {
    super(props);
    this.onLeftIconButtonTouchTap = this.onLeftIconButtonTouchTap.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getMuiTheme(Theme),
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
        <FullWidthSection style={{ paddingLeft: '0px', paddingRight: '0px' }}>
          {this.props.children}
        </FullWidthSection>
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
