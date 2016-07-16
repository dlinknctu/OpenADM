import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable.from({});

export default handleActions({
  USER_LOGGED_IN: (state, action) => ({
    ...state,
    ...action.payload,
  }),

  SETTING_CONTROLLER_RESP: (state, action) => {
    console.log('SETTING_CONTROLLER_RESP', action);
    return state;
  },

}, initialState);
