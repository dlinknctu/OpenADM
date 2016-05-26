import React from 'react';
import AppBar from 'material-ui/AppBar';
import LeftNav from 'material-ui/Drawer';
import Paper from 'material-ui/Paper';
import LeftNavBarItem from './LeftNavBarItem.jsx';
import { shallowEqual } from 'recompose';

const menuItems = [
  { route: 'domain', text: 'Domain', iconType: 'domain' },
  { route: 'domain/three', text: '工三', iconType: 'domain' },
  { route: 'domain/four', text: '工四', iconType: 'domain' },
  { route: 'setting', text: 'Setting', iconType: 'settings' },
  { route: 'not', text: '404 page' },
];

class LeftNavBar extends React.Component {

  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
    this.onTitleTouchTap = this.onTitleTouchTap.bind(this);
    this.onMenuListTap = this.onMenuListTap.bind(this);
    this.state = {
      open: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !shallowEqual(this.state, nextState) ||
           !shallowEqual(this.context, nextContext);
  }

  onTitleTouchTap() {
    this.context.router.push('/');
    this.setState({ open: !this.state.open });
  }

  onMenuListTap(route) {
    this.context.router.push(`/${route}`);
    this.setState({ open: !this.state.open });
  }

  handleToggle() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const menuLists = menuItems.map((data, index) => {
      const isActive = this.context.router.isActive(data.route);
      return (
        <LeftNavBarItem
          key={index}
          primaryText={data.text}
          isActive={isActive}
          iconType={data.iconType}
          route={data.route}
          handleClick={this.onMenuListTap}
        />);
    });

    return (
      <LeftNav
        docked={false}
        open={this.state.open}
        onRequestChange={this.handleToggle}
      >
        {/*<AppBar
          showMenuIconButton={false}
          onTitleTouchTap={this.onTitleTouchTap}
        />*/}
        {<div
        style={{
          backgroundImage: "url('https://cdn.drivenlocal.com/wp-content/uploads/2015/10/Material-design.jpg')",
          backgroundSize: 'cover',
          'height': '100px',
        }}
        ></div>}
        {menuLists}
      </LeftNav>
    );
  }
}

LeftNavBar.contextTypes = {
  router: React.PropTypes.object,
};

export default LeftNavBar;
