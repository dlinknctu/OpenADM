import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable.from({
  coreURL: '',
  controllerURL: '',
  controllerName: '',
});

export default handleActions({
  SETTING_CONTROLLER: (state, { payload }) => state.merge(payload),

  SETTING_CONTROLLER_RESP: (state) => state,

}, initialState);
