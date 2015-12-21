import { createAction } from 'redux-actions';

import WebAPIUtil from '../utils/WebAPIUtil.js';

export const increment = createAction('INCREMENT');
export const decrement = createAction('DECREMENT');

export const fetchData = createAction('FETCH_DATA', WebAPIUtil.fetchRemoteInfo);
export const fetchRowData = createAction('FETCH_ROW_DATA', WebAPIUtil.getRemoteInfo);
export const postUser = createAction('POST_USER', WebAPIUtil.postUser);

export const isLoading = createAction('IS_LOADING');
