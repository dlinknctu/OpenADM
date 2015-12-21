import React, { Component, PropTypes } from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Divider from 'material-ui/lib/divider';

class Profile extends Component {
  render() {
    const profile = this.props.user;
    const list = Object.keys(profile).map((data, index) => (
      <ListItem key={index} primaryText={data} secondaryText={profile[data]} />
    ));
    return (
      <div>
        <List subheader="User Profile">
          {list}
        </List>
        <Divider />
      </div>
    );
  }
}

Profile.propTypes = {
  user: PropTypes.object.isRequired,
};

export default Profile;
