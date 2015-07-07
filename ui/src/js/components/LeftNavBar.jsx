let React = require('react');
let Router = require('react-router');
let { MenuItem, LeftNav, Styles } = require('material-ui');
let { Colors, Spacing, Typography } = Styles;

/** for fake domain, will get it form db */
var fake_id = [
    { id: '1', name: '工程三館' },
    { id: '2', name: '工程四館' },
    { id: '3', name: '工程五館' }
];

var domainList = fake_id.map(function(obj) {
    return { route: '/domain/' + obj.id, text: obj.name };
});

var menuItems = [
    { route: 'home', text: 'Home' },
    { route: 'domain', text: 'Domain' },
    { route: 'uds', text: 'UDS' },
    { type: MenuItem.Types.SUBHEADER, text: 'Domain List' },
];
menuItems = menuItems.concat(domainList);


class LeftNavBar extends React.Component {

  constructor() {
    super();
    this.toggle = this.toggle.bind(this);
    this._getSelectedIndex = this._getSelectedIndex.bind(this);
    this._onLeftNavChange = this._onLeftNavChange.bind(this);
    this._onHeaderClick = this._onHeaderClick.bind(this);
  }

  getStyles() {
    return {
      cursor: 'pointer',
      //.mui-font-style-headline
      fontSize: '24px',
      color: Typography.textFullWhite,
      lineHeight: Spacing.desktopKeylineIncrement + 'px',
      fontWeight: Typography.fontWeightLight,
      backgroundColor: Colors.cyan500,
      paddingLeft: Spacing.desktopGutter,
      paddingTop: '0px',
      marginBottom: '8px'
    };
  }

  render() {
    let header = (
      <div style={this.getStyles()} onTouchTap={this._onHeaderClick}>
        OmniUI
      </div>
    );

    return (
      <LeftNav
        ref="leftNav"
        docked={false}
        isInitiallyOpen={false}
        header={header}
        menuItems={menuItems}
        selectedIndex={this._getSelectedIndex()}
        onChange={this._onLeftNavChange} />
    );
  }

  toggle() {
    this.refs.leftNav.toggle();
  }

  _getSelectedIndex() {
    let currentItem;

    for (let i = menuItems.length - 1; i >= 0; i--) {
      currentItem = menuItems[i];
      if (currentItem.route && this.context.router.isActive(currentItem.route)) return i;
    }
  }

  _onLeftNavChange(e, key, payload) {
    this.context.router.transitionTo(payload.route);
  }

  _onHeaderClick() {
    this.context.router.transitionTo('home');
    this.refs.leftNav.close();
  }

}

LeftNavBar.contextTypes = {
  router: React.PropTypes.func
};

export default LeftNavBar;
