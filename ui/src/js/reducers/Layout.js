import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable({
  gridLayout: [
    { i: 'Flowtable', x: 1, y: 0, w: 3, h: 3 },
    { i: 'ControllerStatus', x: 4, y: 0, w: 3, h: 3 },
    { i: 'PortStatus', x: 4, y: 0, w: 3, h: 3 },
  ],
  hiddenPanel: [],
});

export default handleActions({
  CHANGE_LAYOUT: (state, action) =>
    state.set('gridLayout', Immutable(action.payload)),

  TOGGLE_PANEL: (state, { payload }) => state
    .update('hiddenPanel', arr => {
      const index = arr.indexOf(payload);
      if (index !== -1) {
        return arr.slice(index + 1, arr.length);
      }
      return arr.concat(payload);
    }),

  RESET_LAYOUT: () => initialState,
}, initialState);
