import { handleActions } from 'redux-actions';
import { fromJS, Map } from 'immutable';
import mockdata from '../components/Topology/mockdata';
const initialState = fromJS({});

export default handleActions({
  GET_MOCK_DATA: (state) => state
    .set('nodes', fromJS(mockdata.nodes))
    .set('links', fromJS(mockdata.links)),

  CHOOSE_TOPOLOGY_NODE: (state, { payload }) => state.updateIn(['selectNodes'],
    arr => arr.push(payload)),

  CANCEL_TOPOLOGY_NODE: (state, { payload }) => state.updateIn(['selectNodes'],
    arr => arr.filter(d => !(d === payload))),

  UPDATE_TOPOLOGY: (state, { payload }) => {
    const result = state.updateIn(['nodes'], () => fromJS(payload.nodes));
    return result;
  },
  ADD_NODE: (state) => state.updateIn(['nodes'],
    arr => arr.push(Map(RandomNode()))),
}, initialState);

const RandomNode = () => ({
  name: `Random${Math.floor(Math.random() * 10)}`,
  group: Math.floor(Math.random() * 10),
});
