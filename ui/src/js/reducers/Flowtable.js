import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable({
  filterString: '',
  visibleField: [],
  flowlist: [],
});

export default handleActions({

  FLOW_RESP: (state, action) => state
    .update('flowlist', () => action.payload),


  'FLOW/TOP_RESP': (state, action) => state
    .update('flowlist', () => action.payload),

}, initialState);
