import { createAction } from 'redux-actions';

export const subscribe = createAction('SUBSCRIBE');
export const clearAllPath = createAction('CLEAR_ALL_PATH');
export const restoreCore = () => ({
  type: 'OTHER',
  payload: {
    url: 'reset_datastore',
  },
});

export const connectSocket = createAction('CONNECT_SOCKET');

export const settingController = payload => dispatch => {
  dispatch(connectSocket(payload));
  return dispatch({ type: 'SETTING_CONTROLLER', payload });
};
