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


export const clickNode = createAction('CLICK_NODE');
export const clickLink = createAction('CLICK_LINK');
export const selectNode = createAction('SELECT_NODE');
export const dragNode = createAction('DRAG_NODE');

export const search = createAction('SEARCH_NODE');
export const tagChange = createAction('TAG_CHANGE');
export const levelChange = createAction('LEVEL_CHANGE');

export const packet = createAction('PACKET');
