import { createAction } from 'redux-actions';

export const flowmode = createAction('FLOWMODE');
export const canelSelectFlow = createAction('CANEL_SELECT_FLOW');
export const flowtableClick = createAction('FLOWTABLE_CLICK');

export const simulate = payload => ({
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
