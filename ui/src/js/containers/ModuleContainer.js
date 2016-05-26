import React from 'react';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
const GridLayout = WidthProvider(ReactGridLayout);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { changeLayout } from '../actions/LayoutAction';
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
};

const mapStateToProps = (state) => ({
  layout: state.layout,
});

const ModuleContainer = compose(
  connect(mapStateToProps),
  withHandlers({
    onLayoutChange: ({ layout, dispatch }) => newLayout => {
      const filterLayout = newLayout.map(d => _.omit(d, 'moved'));
      if (!_.isEqual(layout, filterLayout)) {
        dispatch(changeLayout(filterLayout));
      }
    },
  }),
  pure
)(({ layout, children, onLayoutChange }) => {
  const layoutObj = layout.asMutable({ deep: true });

  const module = children.map((element, index) => {
    const key = layoutObj[index].i;
    return <Paper key={key} style={styles.itemStyle}><div>{element}</div></Paper>;
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
