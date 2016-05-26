import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable([
  { i: 'flowtable', x: 1, y: 0, w: 3, h: 3 },
  { i: 'controllerStatus', x: 4, y: 0, w: 3, h: 3 },
]);

export default handleActions({
  CHANGE_LAYOUT: (state, action) => action.payload,
  RESET_LAYOUT: () => initialState,
}, initialState);
