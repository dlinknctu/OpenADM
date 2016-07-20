import React, { PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
  actionBtn: {
    margin: '0 5px',
  },
  simulateBtn: {
    position: 'absolute',
    left: '15px',
  },
};

const Flowmod = ({ isOpen, flowmode, canelSelectFlow, handleSimulate }) => {
  const actions = [
    <RaisedButton
      label="Simulate"
      primary
      style={styles.simulateBtn}
      onClick={() => handleSimulate()}
    />,
    <RaisedButton
      label="Cancel"
      secondary
      style={styles.actionBtn}
      onClick={() => canelSelectFlow()}
    />,
    <RaisedButton
      label="Submit"
      primary
      style={styles.actionBtn}
      keyboardFocused
      onClick={() => flowmode()}
    />,
  ];
  return (
    <Dialog
      title="Flow Mod"
      actions={actions}
      modal={false}
      open={isOpen}
      autoScrollBodyContent
    >
      <h2>Flow mod</h2>
    </Dialog>
  );
};

Flowmod.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  flowmode: PropTypes.func.isRequired,
  canelSelectFlow: PropTypes.func.isRequired,
  handleSimulate: PropTypes.func.isRequired,
};

export default Flowmod;
