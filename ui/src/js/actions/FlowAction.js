import { createAction } from 'redux-actions';

export const flowmode = createAction('FLOWMODE');
export const canelSelectFlow = createAction('CANEL_SELECT_FLOW');
export const flowtableClick = createAction('FLOWTABLE_CLICK');

export const simulatePath = payload => ({
  type: 'OTHER',
  payload: {
    url: 'simulate',
    request: payload,
  },
});

/**
 * request: {
   dpid: payload.dpid,
   flow: payload.flow,
 },
 * @param  {[type]} payload [description]
 * @return {[type]}         [description]
 */
export const getAllFlow = payload => (payload.controller ? {
  type: 'OTHER',
  payload: {
    url: 'flow',
    request: payload,
  },
} : {
  type: 'OTHER',
  payload: {
    url: 'flow',
  },
});

export const getFlowBy = payload => ({
  type: 'OTHER',
  payload: {
    url: 'flow',
    request: {
      controller: payload.controller,
      dpid: payload.dpid,
    },
  },
});

export const getTopFlow = () => ({
  type: 'OTHER',
  payload: {
    url: 'flow/top',
  },
});

export const getTopFlowBy = payload => ({
  type: 'OTHER',
  payload: {
    url: 'flow/top',
    request: {
      controller: payload.controller,
      dpid: payload.dpid,
    },
  },
});

export const addFilter = createAction('ADD_FILTER');
export const deleteFilter = createAction('DELETE_FILTER');
export const toggleSearch = createAction('TOGGLE_SEARCH');
export const toggleSetting = createAction('TOGGLE_SETTING');
export const toggleAction = createAction('TOGGLE_ACTION');
export const showColumnSetting = createAction('SHOW_COLUMN_SETTING');
export const selectFlow = createAction('SELECT_FLOW');
export const submiteFlowmod = payload => ({
  type: 'OTHER',
  payload: {
    url: 'flowmod',
    request: payload,
  },
});
