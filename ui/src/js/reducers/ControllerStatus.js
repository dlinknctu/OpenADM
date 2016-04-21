import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const initialState = fromJS({});

export default handleActions({
  USER_LOGGED_IN: (state, action) => ({
    ...state,
    ...action.payload,
  }),

}, initialState);
