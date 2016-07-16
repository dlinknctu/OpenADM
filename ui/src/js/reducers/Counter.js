import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable.from({ count: 0, name: 'default' });

export default handleActions({
  COUNTER_INCREASE: (state, { payload = 1 }) => state.merge({
    count: state.count + payload,
  }),

  COUNTER_DECREASE: (state, { payload = 1 }) => state.merge({
    count: state.count - payload,
  }),

  CHANGE_NAME: (state, { payload }) => state.merge({
    name: payload,
  }),

}, initialState);
