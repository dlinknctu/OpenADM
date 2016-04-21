import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const initialState = fromJS({ count: 0, name: 'default' });

export default handleActions({
  COUNTER_INCREASE: (state, { payload = 1 }) => state.merge({
    count: state.get('count') + payload,
  }),

  COUNTER_DECREASE: (state, { payload = 1 }) => state.merge({
    count: state.get('count') - payload,
  }),

  CHANGE_NAME: (state, { payload }) => state.merge({
    name: payload,
  }),

}, initialState);
