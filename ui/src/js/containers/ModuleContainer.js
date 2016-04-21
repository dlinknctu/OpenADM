import React from 'react';
import Paper from 'material-ui/lib/paper';
import { connect } from 'react-redux';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
const GridLayout = WidthProvider(ReactGridLayout);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { layoutChange } from '../actions/LayoutAction';
import { withHandlers, pure, compose } from 'recompose';

const mapStateToProps = (state) => ({
  layout: state.get('layout'),
});

const ModuleContainer = compose(
  connect(mapStateToProps),
  withHandlers({
    onLayoutChange: ({ dispatch }) => layout => dispatch(layoutChange(layout)),
  }),
  pure
)(({ layout, children, onLayoutChange }) => {
  const layoutObj = layout.toJS();
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
      onLayoutChange={onLayoutChange}
    >
      {module}
    </GridLayout>
  );
});

export default ModuleContainer;
