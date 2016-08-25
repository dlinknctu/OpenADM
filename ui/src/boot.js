import React from 'react';
import ReactDOM from 'react-dom';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';
import Immutable from 'seamless-immutable';
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from './js/stores/configureStore';
import Root from './js/Root.js';

injectTapEventPlugin();

const initialState = Immutable.from({
  routing: { locationBeforeTransitions: null },
  layout: {
    gridLayout: [
      { i: 'Flowtable', x: 1, y: 5, w: 8, h: 7 },
      { i: 'ControllerStatus', x: 4, y: 1, w: 5, h: 3 },
      { i: 'PortStatus', x: 4, y: 0, w: 5, h: 3 },
      { i: 'SettingContainer', x: 1, y: 0, w: 3, h: 9 },
    ],
    hiddenPanel: ['Flowtable', 'ControllerStatus', 'PortStatus', 'SettingContainer'],
    maximumPanel: '',
  },
  setting: {
    coreURL: '',
    controllerURL: '',
    controllerName: '',
  },
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
    flowlist: [],
    selectedFlow: {},
    selectedSwitch: [],
    selectedController: '',
    showSearch: false,
    filters: [
      { category: 'flowId', operator: '!=', value: '0' },
      { category: 'counterByte', operator: '>', value: '0' },
    ],
    showSetting: false,
    showColumn: ['flowId', 'controller', 'dpid', 'actions', 'counterByte'],
    showAction: false,
  },
  portStatus: [],
});

const store = configureStore(initialState, browserHistory);
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
