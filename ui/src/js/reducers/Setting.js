import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable({});

export default handleActions({
  USER_LOGGED_IN: (state, action) => ({
    ...state,
    ...action.payload,
  }),

}, initialState);
