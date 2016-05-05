import { handleActions } from 'redux-actions';
import { fromJS, Map } from 'immutable';
import mockdata from '../components/Topology/mockdata';
const initialState = fromJS({});

const findNodeIndex = (topoNodes, nodeType, uuid) => {
  switch (nodeType) {
    case 'switch':
      return topoNodes.findIndex(d => d.type === nodeType && d.dpid === uuid);
    case 'host':
      return topoNodes.findIndex(d => d.type === nodeType && d.mac === uuid);
    default:
      return null;
  }
};

export default handleActions({
  GET_MOCK_DATA: (state) => state
    .set('nodes', fromJS(mockdata.nodes))
    .set('links', fromJS(mockdata.links)),

  CHOOSE_TOPOLOGY_NODE: (state, { payload }) => state.updateIn(['selectNodes'],
    arr => arr.push(payload)),

  CANCEL_TOPOLOGY_NODE: (state, { payload }) => state.updateIn(['selectNodes'],
    arr => arr.filter(d => !(d === payload))),

  UPDATE_TOPOLOGY: (state, { payload }) => state
    .updateIn(['nodes'], () => fromJS(payload.nodes))
    .updateIn(['links'], () => fromJS(payload.links)),

  ADD_NODE: (state) => state.updateIn(['nodes'],
    arr => arr.concat(Map(RandomNode()))),

  ADD_TOPOLOGY_DEVICE: (state, { payload }) => {
    if (payload.length !== undefined) {
      payload.map(d => {
        // push static node
        // let position = this.state.stickyTopo.get(d.dpid) || null;
        // if (position)
          // d = _.assign(d, { x: position.x, y: position.y, fixed: true });
        return state.get('nodes').push(d);
      });
    }
    return state.get('nodes').push(payload);
  },

  DEL_TOPOLOGY_DEVICE: (state, { payload }) => state.updateIn(['nodes'],
    arr => arr.filter(d => !d.get('dpid') === payload.dpid)
  ),

  ADD_TOPOLOGY_HOST: (state, { payload }) => {
    if (payload.length !== undefined) {
      const mutableState = state.asMutable();
      payload.forEach(host => {
          // let position = this.state.stickyTopo.get(host.mac) || null;
          // if (position)
          //   host = _.assign(host, { x: position.x, y: position.y, fixed: true });
          //
        mutableState.updateIn(['nodes'], arr => arr.push(host))
          .updateIn(['links'], arr => arr.push({
            source: findNodeIndex(mutableState.get('nodes'), 'switch', host.location.dpid),
            target: mutableState.get('nodes').size,
            sourcePort: host.location.port,
            type: 's2h',
            linkId: host.mac,
          }));
      });
      return mutableState.asImmutable();
    }
    return state.updateIn(['nodes'], arr => arr.push(payload))
      .updateIn(['links'], arr => arr.push({
        source: findNodeIndex(state.get('nodes'), 'switch', payload.location.dpid),
        target: arr.size,
        sourcePort: payload.location.port,
        type: 's2h',
        linkId: payload.mac,
      }));
  },

  DEL_TOPOLOGY_HOST: (state, { payload }) => state
    .updateIn(['links'],
      arr => arr.filter(d => !d.get('linkId') === payload.dpid))
    .updateIn(['nodes'],
      arr => arr.filter(d => !d.get('mac') === payload.mac)),

  ADD_TOPOLOGY_PORT: (state, { payload }) => {
    return state;
  },

  DEL_TOPOLOGY_PORT: (state, { payload }) => {
    return state;
  },

}, initialState);
const RandomNode = () => ({
  name: `Random${Math.floor(Math.random() * 10)}`,
  dpid: '00:00:00:' + Math.floor(Math.random() * 10),
  type: 'switch'
});
