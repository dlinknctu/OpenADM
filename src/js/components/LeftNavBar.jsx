import React from 'react';
import AppBar from 'material-ui/lib/app-bar';
import LeftNav from 'material-ui/lib/left-nav';
import LeftBavBarItem from './LeftNavBarItem.jsx';

class LeftNavBar extends React.Component {

  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
    this.onTitleTouchTap = this.onTitleTouchTap.bind(this);
    this.onMenuListTap = this.onMenuListTap.bind(this);
    this.state = {
      open: false,
      menuItems: [
        { route: 'list', text: 'List' },
        { route: 'login', text: 'Login' },
        { route: 'about', text: 'About (login)' },
        { route: 'redux', text: 'Redux page' },
        { route: 'not', text: '404 page' },
      ],
    };
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
    const menuLists = this.state.menuItems.map((data, index) => {
      const isActive = this.context.router.isActive(data.route);
      return (
        <LeftBavBarItem
          key={index}
          primaryText={data.text}
          isActive={isActive}
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
        <AppBar
          title="NCTU-CSCC"
          showMenuIconButton={false}
          onTitleTouchTap={this.onTitleTouchTap}
        />
        {menuLists}
      </LeftNav>
    );
  }

}

LeftNavBar.contextTypes = {
  router: React.PropTypes.object,
};

export default LeftNavBar;
