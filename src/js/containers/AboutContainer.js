import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Profile from '../components/Profile.jsx';

class AboutContainer extends Component {
  render() {
    return (
      <div>
        <Profile user={this.props.user} />
      </div>
    );
  }
}

AboutContainer.propTypes = {
  user: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(AboutContainer);
