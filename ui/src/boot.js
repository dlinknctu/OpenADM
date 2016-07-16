import React from 'react';
import ReactDOM from 'react-dom';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';
import Immutable from 'seamless-immutable';
import configureStore from './js/stores/configureStore';
import { ioInit } from './js/middlewares/socket';
import Root from './js/Root.js';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const initialState = Immutable.from({
  counter: { count: 0, name: 'default' },
  routing: { locationBeforeTransitions: null },
  layout: {
    gridLayout: [
      { i: 'Flowtable', x: 1, y: 5, w: 8, h: 7 },
      { i: 'ControllerStatus', x: 4, y: 0, w: 5, h: 3 },
      { i: 'PortStatus', x: 4, y: 0, w: 5, h: 3 },
      { i: 'SettingContainer', x: 1, y: 0, w: 5, h: 8 },
    ],
    hiddenPanel: ['Flowtable', 'ControllerStatus', 'PortStatus', 'SettingContainer'],
    maximumPanel: '',
  },
  setting: {},
  topology: {
    filterType: [
      { type: 'type', filter: 'switch' },
      { type: 'id', filter: '00:0a:00:00:00:51:85:91' },
    ],
    selectNodes: {},
    level: 0,
    nodes: [],
    fixedNode: {},
    links: [],
    controllerList: [],
  },
  controllerStatus: [],
  flowtable: {
    filterString: '',
    visibleField: ['ipv4'],
    flowlist: [{ controller: '', flows: [] }],
    selectFlow: {},
  },
  portStatus: [],
});

const store = configureStore(initialState, browserHistory);
ioInit(store);
const history = syncHistoryWithStore(
  browserHistory,
  store,
  { selectLocationState: state => state.routing }
);

ReactDOM.render(
  <Root store={store} history={history} />,
  document.getElementById('app')
);

export default store;
