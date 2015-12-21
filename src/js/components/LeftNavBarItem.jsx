import React, { PropTypes } from 'react';
import MenuItem from 'material-ui/lib/menus/menu-item';

class LeftBavBarItem extends React.Component {

  constructor(props) {
    super(props);
    this.onMenuItemTap = this.onMenuItemTap.bind(this);
  }
  onMenuItemTap() {
    const { handleClick, route } = this.props;
    handleClick(route);
  }

  render() {
    const { primaryText, isActive } = this.props;
    return (
      <MenuItem
        primaryText={primaryText}
        disabled={isActive}
        checked={isActive}
        onTouchTap={this.onMenuItemTap}
      />
  );
  }
}

LeftBavBarItem.propTypes = {
  primaryText: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  route: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};

module.exports = LeftBavBarItem;
