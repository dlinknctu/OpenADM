import { createAction } from 'redux-actions';

import WebAPIUtil from '../utils/WebAPIUtil.js';

export const userLoggedIn = createAction('USER_LOGGED_IN', WebAPIUtil.login);
export const userLoggedInWithToken = createAction('USER_LOGGED_IN', WebAPIUtil.login_token);
export const userLoggedOut = createAction('USER_LOGGED_OUT', WebAPIUtil.logout);

export const isLoading = createAction('IS_LOADING');

export function csccLogin(payload) {
  return (dispatch) => WebAPIUtil.login(payload)
    .then(token => WebAPIUtil.login_token(token)
      .then(user => dispatch({ type: 'CSCC_LOGIN_SUCCESS', payload: user }))
  );
}
