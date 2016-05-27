import React from 'react';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import MaximizeIcon from 'material-ui/svg-icons/navigation/fullscreen';
const GridLayout = WidthProvider(ReactGridLayout);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { changeLayout, togglePanel, maximizePanel } from '../actions/LayoutAction';
import { withHandlers, pure, compose } from 'recompose';
import _ from 'lodash';
import classNames from 'classnames';
import styles from '../components/module.css';

const mapStateToProps = (state) => ({
  gridLayout: state.layout.gridLayout,
  hiddenPanel: state.layout.hiddenPanel,
  maximumPanel: state.layout.maximumPanel,
});

const ModuleContainer = compose(
  connect(mapStateToProps),
  withHandlers({
    onLayoutChange: ({ gridLayout, dispatch }) => newLayout => {
      const filterLayout = newLayout.map(d => _.omit(d, 'moved'));
      if (!_.isEqual(gridLayout, filterLayout)) {
        dispatch(changeLayout(filterLayout));
      }
    },
    onTogglePanel: ({ dispatch }) => index => {
      dispatch(togglePanel(index));
    },
    onMaximizePanel: ({ dispatch }) => index => {
      dispatch(maximizePanel(index));
    },
  }),
  pure
)(({ gridLayout, hiddenPanel, maximumPanel, children,
  onLayoutChange, onTogglePanel, onMaximizePanel }) => {
  const layoutObj = gridLayout.asMutable({ deep: true });
  const module = children.map((element, index) => {
    const key = layoutObj[index].i;

    const gridItemStyle = classNames({
      [styles.gridItem]: true,
      [styles.hidden]: hiddenPanel.indexOf(key) !== -1,
      [styles.max]: key === maximumPanel,
    });
    return (
      <Paper
        key={key}
        className={gridItemStyle}
      >
        <CloseIcon
          className={styles.closeIcon}
          color={'red'}
          onClick={() => onTogglePanel(key)}
        />
        <MaximizeIcon
          className={styles.maxIcon}
          color={'blue'}
          onClick={() => onMaximizePanel(key)}
        />
        <div>{element}</div>
      </Paper>
    );
  });

  return (
    <GridLayout
      className={styles.gridLayout}
      layout={layoutObj}
      cols={12}
      rowHeight={30}
      autoSize={false}
      verticalCompact={false}
      onLayoutChange={onLayoutChange}
    >
      {module}
    </GridLayout>
  );
});

export default ModuleContainer;
