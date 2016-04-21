import { handleActions } from 'redux-actions';
import { fromJS, Map } from 'immutable';

const initialState = fromJS({});

export default handleActions({
  CHOOSE_TOPOLOGY_NODE: (state, { payload }) => state.updateIn(['selectNodes'],
    arr => arr.push(Map(payload))),

}, initialState);
