import React from 'react';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
import CloseIcon from 'material-ui/svg-icons/Navigation/close';
const GridLayout = WidthProvider(ReactGridLayout);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { changeLayout, togglePanel } from '../actions/LayoutAction';
import { withHandlers, pure, compose } from 'recompose';
import _ from 'lodash';
const styles = {
  gridStyle: {
    width: '100vw',
    height: '90vh',
  },
  itemStyle: {
    zIndex: 5,
    borderRadius: '5px',
  },
  closeStyle: {
    position: 'absolute',
    right: '0px',
  },
};

const mapStateToProps = (state) => ({
  gridLayout: state.layout.gridLayout,
  hiddenPanel: state.layout.hiddenPanel,
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
  }),
  pure
)(({ gridLayout, hiddenPanel, children, onLayoutChange, onTogglePanel }) => {
  const layoutObj = gridLayout.asMutable({ deep: true });
  const module = children.map((element, index) => {
    const key = layoutObj[index].i;
    const isHidden = (hiddenPanel.indexOf(key) !== -1);
    console.log("key",key, isHidden);
    return (
      <Paper
        key={key}
        style={isHidden ?
          Object.assign({}, styles.itemStyle, { visibility: 'hidden' }) :
          styles.itemStyle
        }
      >
        <CloseIcon
          style={styles.closeStyle}
          hoverColor={'red'}
          onClick={() => onTogglePanel(key)}
        />
        <div>{element}</div>
      </Paper>
    );
  });

  return (
    <GridLayout
      className="layout"
      style={styles.gridStyle}
      layout={layoutObj}
      cols={12}
      rowHeight={30}
      verticalCompact={false}
      onLayoutChange={onLayoutChange}
    >
      {module}
    </GridLayout>
  );
});

export default ModuleContainer;
