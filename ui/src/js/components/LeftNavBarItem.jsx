import React, { PropTypes } from 'react';
import MenuItem from 'material-ui/MenuItem';
import { onlyUpdateForKeys } from 'recompose';
import Divider from 'material-ui/Divider';
import SettingIcon from 'material-ui/svg-icons/action/settings';
import DomainIcon from 'material-ui/svg-icons/social/domain';

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
    const { primaryText, isActive, iconType } = this.props;
    return (
      <div>
        <Divider inset />
        <MenuItem
          primaryText={primaryText}
          disabled={isActive}
          checked={isActive}
          leftIcon={iconType === 'domain' ? <DomainIcon /> : <SettingIcon />}
          onTouchTap={this.onMenuItemTap}
        />
      </div>
    );
  }
}

LeftBavBarItem.propTypes = {
  primaryText: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  iconType: PropTypes.string,
  route: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};

export default onlyUpdateForKeys(['isActive'])(LeftBavBarItem);
