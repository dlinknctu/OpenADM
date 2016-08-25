import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable.from([]);

export default handleActions({
  PORT_RESP: (state, { payload }) => Immutable.from(payload),

}, initialState);
