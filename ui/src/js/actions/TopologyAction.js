import { createAction } from 'redux-actions';

export const chooseTopologyNode = createAction('CHOOSE_TOPOLOGY_NODE');
export const cancelTopologyNode = createAction('CANCEL_TOPOLOGY_NODE');

export const updateTopology = createAction('UPDATE_TOPOLOGY');

export const addTopologyDevice = createAction('ADD_TOPOLOGY_DEVICE');
export const delTopologyDevice = createAction('DEL_TOPOLOGY_DEVICE');
export const addTopologyHost = createAction('ADD_TOPOLOGY_HOST');
export const delTopologyHost = createAction('DEL_TOPOLOGY_HOST');
export const addTopologyPort = createAction('ADD_TOPOLOGY_PORT');
export const delTopologyPort = createAction('DEL_TOPOLOGY_PORT');

export const packet = createAction('PACKET');

export const simulate = (payload) => ({
  type: 'OTHER',
  payload: {
    url: 'simulate',
    request: {
      dpid: payload.dpid,
      flow: payload.flow,
    },
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
export const getAllFlow = () => ({
  type: 'OTHER',
  payload: {
    url: 'flow',
  },
});
export const getFlowBy = (payload) => ({
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

export const getTopFlowBy = (payload) => ({
  type: 'OTHER',
  payload: {
    url: 'flow/top',
    request: {
      controller: payload.controller,
      dpid: payload.dpid,
    },
  },
});
