import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const HomeContainer = () => (
  <div>
    <h1>Home container</h1>
    <RaisedButton label="My Button" secondary />
  </div>
);

HomeContainer.propTypes = {
  PROPS_NAME: PropTypes.string,
};

export default HomeContainer;
