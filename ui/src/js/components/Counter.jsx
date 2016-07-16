import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const Counter = ({ increment, decrement }) => (
  <div>
    <RaisedButton
      label="increment"
      style={{ margin: 12 }}
      onClick={increment}
      secondary
    />
    <RaisedButton
      label="decrement"
      style={{ margin: 12 }}
      onClick={decrement}
      secondary
    />
  </div>
);

Counter.propTypes = {
  increment: PropTypes.func.isRequired,
  decrement: PropTypes.func.isRequired,
};

export default Counter;
