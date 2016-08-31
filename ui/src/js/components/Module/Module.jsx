import React, { PropTypes } from 'react';
import { compose } from 'redux';
import { onlyUpdateForKeys, withHandlers } from 'recompose';
import ResizableAndMovable from 'react-resizable-and-movable';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import FullscreenIcon from 'material-ui/svg-icons/navigation/fullscreen';
import Paper from 'material-ui/Paper';
import './module.css';

const ModuleController = ({ maximizeWindow, minimumWindow }) =>
  <div className="controlPanel">
    <FullscreenIcon
      className="maxIcon"
      color={'white'}
      hoverColor={'red'}
      onClick={maximizeWindow}
    />
    <CloseIcon
      className="closeIcon"
      color={'white'}
      hoverColor={'red'}
      onClick={minimumWindow}
    />
  </div>;

const enhance = compose(
  onlyUpdateForKeys(['x', 'y', 'width', 'height', 'zIndex']),
  withHandlers({
    handleDragStop: props => (e, ui) => {
      if (ui.position.left !== props.x && ui.position.top !== props.y)
        props.changePosition({
          position: ui.position,
          name: props.name,
        });
    },
    handleResizeStop: props => (direction, styleSize, clientSize, delta) => {
      if(delta.width !== 0 && delta.height !== 0)
        props.changeSize({
          size: clientSize,
          name: props.name,
          direction,
          delta,
        });
    },
    handleMaximizeWindow: props => () => {
      props.maximizeWindow(props.name);
    },
    handleMinimumWindow: props => () => {
      props.minimumWindow(props.name);
    },
    handlezIndex: props => () => {
      props.changezIndex(props.name);
    },
  })
);

const Module = enhance(
  ({
    x, y, width, height, zIndex,
    handlezIndex, handleDragStop, handleResizeStop,
    handleMinimumWindow, handleMaximizeWindow, children,
  }) =>
    <ResizableAndMovable
      x={x}
      y={y}
      width={width}
      height={height}
      onResizeStart={handlezIndex}
      onDragStart={handlezIndex}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      canUpdateSizeByParent
      canUpdatePositionByParent
      zIndex={zIndex}
    >
      <ModuleController
        minimumWindow={handleMinimumWindow}
        maximizeWindow={handleMaximizeWindow}
      />
      <Paper className="gridItem">
        {children}
      </Paper>
    </ResizableAndMovable>
);

export default Module;
