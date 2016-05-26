import React from 'react';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
const GridLayout = WidthProvider(ReactGridLayout);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { changeLayout } from '../actions/LayoutAction';
import { withHandlers, pure, compose } from 'recompose';
import Immutable from 'seamless-immutable';

const mapStateToProps = (state) => ({
  layout: state.layout,
});

const ModuleContainer = compose(
  connect(mapStateToProps),
  withHandlers({
    onLayoutChange: ({ layout, dispatch }) => newLayout => {
      const imLayout = Immutable(newLayout);
      if (!layout === imLayout) {
        dispatch(changeLayout(imLayout));
      }
    },
  }),
  pure
)(({ layout, children, onLayoutChange }) => {
  const layoutObj = layout.asMutable();
  const module = children.map((element, index) => {
    const key = layoutObj[index].i;
    return <Paper key={key}><div>{element}</div></Paper>;
  });
  return (
    <GridLayout
      className="layout"
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
