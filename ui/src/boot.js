import React from 'react';
import ReactDOM from 'react-dom';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';
import Immutable from 'seamless-immutable';
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from './js/stores/configureStore';
import Root from './js/Root.jsx';

injectTapEventPlugin();

const initialState = Immutable.from({
  routing: { locationBeforeTransitions: null },
  layout: {
    layout: [
      { x: 50, y: 10, width: 320, height: 320, name: 'SettingController', zIndex: 10 },
      { x: 400, y: 10, width: 200, height: 100, name: 'ControllerStatus', zIndex: 10 },
      { x: 400, y: 130, width: 500, height: 200, name: 'PortStatus', zIndex: 10 },
      { x: 50, y: 350, width: 800, height: 200, name: 'Flowtable', zIndex: 10 },
    ],
    hidden: ['shortcuts'],
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
