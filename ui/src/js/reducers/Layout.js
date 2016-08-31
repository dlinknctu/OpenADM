import { handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import Immutable from 'seamless-immutable';

const initialState = Immutable.from({
  layout: [
    { x: 50, y: 10, width: 320, height: 320, name: 'SettingController', zIndex: 10 },
    { x: 400, y: 10, width: 200, height: 100, name: 'ControllerStatus', zIndex: 10 },
    { x: 400, y: 130, width: 500, height: 200, name: 'PortStatus', zIndex: 10 },
    { x: 50, y: 350, width: 800, height: 200, name: 'Flowtable', zIndex: 10 },
  ],
  hidden: ['shortcuts'],
});

const layout = handleActions({
  RESET_LAYOUT: () => initialState.layout,
  CHANGE_POSITION: (state, { payload }) => state
    .map(d =>
      (d.name === payload.name) ?
      ({
        ...d,
        x: payload.position.left,
        y: payload.position.top,
      }) : d
    ),
  CHANGE_SIZE: (state, { payload }) => {
    const { name, size, direction, delta } = payload;

    if (direction === 'topRight') {
      return state.map(d =>
        (d.name === name) ?
        ({
          ...d,
          y: d.y - delta.height,
          ...size,
        }) : d
      );
    } else if (direction === 'topLeft') {
      return state.map(d =>
        (d.name === name) ?
        ({
          ...d,
          x: d.x - delta.width,
          y: d.y - delta.height,
          ...size,
        }) : d
      );
    } else if (direction === 'bottomLeft') {
      return state.map(d =>
        (d.name === name) ?
        ({
          ...d,
          x: d.x - delta.width,
          ...size,
        }) : d
      );
    } else {
      return state.map(d =>
        (d.name === name) ?
        ({
          ...d,
          ...payload.size,
        }) : d
      );
    };
  },
  MAXIMIZE_WINDOW: (state, { payload }) => state
    .map( (d, i) =>
      (d.name === payload) ?
      ({
        ...d,
        width: '95%',
        height: '80%',
        x: 0,
        y: 0,
        zIndex: 10,
      }) : ({ ...d, zIndex: 10 - i })
    ),
  MINIMUM_WINDOW: (state, { payload }) => state
    .map( d =>
      (d.name === payload) ?
      ({
        ...d,
        width: 10,
        height: 10,
        zIndex: -1,
      }) : d
    ),
  CHANGEZ_INDEX: (state, { payload }) => state
    .map((d, i) =>
      (d.name === payload) ?
      ({
        ...d,
        zIndex: 10,
      }) : ({ ...d, zIndex: 10 - i })
    ),
}, initialState.layout);

const hidden = handleActions({
  TOGGLE_MODULE: (state, { payload }) => (state.indexOf(payload) == -1) ?
    state.concat(payload) :
    state.filter(d => d != payload),
  RESET_LAYOUT: () => initialState.hidden,
}, initialState.hidden);

export default combineReducers({ layout, hidden });
