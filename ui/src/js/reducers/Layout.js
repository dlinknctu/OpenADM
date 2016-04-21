import { handleActions } from 'redux-actions';
import { List } from 'immutable';

const initialState = List([]);

export default handleActions({
  LAYOUT_CHANGE: (state, action) => List(action.payload),
}, initialState);
