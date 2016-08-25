import React, { PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import classNames from 'classnames';
import styles from './module.css';

const Module = () => {
  const { identify, isHidden, element, onTogglePanel } = this.props;
  const gridItemStyle = classNames({
    [styles.gridItem]: true,
    [styles.hidden]: isHidden,
  });
  return (
    <Paper className={gridItemStyle}>
      <CloseIcon
        className={styles.gridClose}
        hoverColor={'red'}
        onClick={() => onTogglePanel(identify)}
      />
      <div>{element}</div>
    </Paper>
  );
};

Module.propTypes = {
  identify: PropTypes.string.isRequired,
  isHidden: PropTypes.bool.isRequired,
  element: PropTypes.element.isRequired,
  onTogglePanel: PropTypes.func.isRequired,
};

export default Module;
