import React, { PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import { withState } from 'recompose';
import styles from './module.css';


const PaperPanel = withState('zDepth', 'setDepth', 1)(
  ({ zDepth, setDepth, children }) =>
    <Paper
      className={styles.paperPanel}
      zDepth={zDepth}
      onMouseOut={() => setDepth(1)}
      onMouseOver={() => setDepth(2)}
    >
      {children}
    </Paper>
);

PaperPanel.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element,
  ]),
};

export default PaperPanel;
