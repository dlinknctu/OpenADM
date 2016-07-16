import React from 'react';
import { createDevTools } from 'redux-devtools';
import DockMonitor from 'redux-devtools-dock-monitor';
import MultipleMonitors from 'redux-devtools-multiple-monitors';
import LogMonitor from 'redux-devtools-log-monitor';
import Inspector from 'redux-devtools-inspector';
import ChartMonitor from 'redux-devtools-chart-monitor';
import Dispatcher from 'redux-devtools-dispatch';

export default createDevTools(
  <DockMonitor
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    changeMonitorKey="ctrl-m"
    defaultIsVisible={false}
  >
    <Inspector supportImmutable />
    <ChartMonitor />
    <MultipleMonitors>
      <LogMonitor />
      <Dispatcher />
    </MultipleMonitors>
  </DockMonitor>
);
