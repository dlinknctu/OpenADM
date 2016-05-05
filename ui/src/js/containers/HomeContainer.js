import React, { Component, PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

class HomeContainer extends Component {
  render() {
    return (
      <div>
        <h1>Home container</h1>
        <RaisedButton label="My Button" secondary />
      </div>
    );
  }
}

HomeContainer.propTypes = {
  PROPS_NAME: PropTypes.string
};

export default HomeContainer;
