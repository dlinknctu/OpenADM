/**
 * Master Component
 * the root component
 */
import React, { PropTypes } from 'react';
import LeftNavBar from './components/LeftNavBar.jsx';
import { AppCanvas, AppBar } from 'material-ui';
import FullWidthSection from './components/FullWidthSection.jsx';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import Theme from '../theme.js';

class Master extends React.Component {

    constructor(props) {
      super(props);
      this.onLeftIconButtonTouchTap = this.onLeftIconButtonTouchTap.bind(this);
    }

    getChildContext() {
      return {
        muiTheme: ThemeManager.getMuiTheme(Theme),
      };
    }

    onLeftIconButtonTouchTap() {
      this.refs.leftNav.handleToggle();
    }

    render() {
      return (
            <AppCanvas>
              <AppBar
                onLeftIconButtonTouchTap={this.onLeftIconButtonTouchTap}
                title="NCTU-CSCC"
              />
              <LeftNavBar ref="leftNav" />
              <FullWidthSection>
                {this.props.children}
              </FullWidthSection>
            </AppCanvas>
        );
    }
}

Master.propTypes = {
  children: PropTypes.object.isRequired,
};

Master.contextTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

Master.childContextTypes = {
  muiTheme: PropTypes.object,
};

module.exports = Master;
