import Immutable from 'seamless-immutable';
import _ from 'lodash';
import Topo from '../components/Topology/Topo.js';

const initalState = {
  nodes: [{
    level: 0,
    nodeType: 'switch',
    dpid: '0101',
    controller: 'ryu1',
    tags: [],
  }, {
    level: 0,
    nodeType: 'switch',
    dpid: '0102',
    controller: 'ryu1',
    tags: [],
  }, {
    level: 0,
    nodeType: 'host',
    mac: '00ab',
    controller: 'ryu1',
    tags: [],
  }, {
    level: 0,
    nodeType: 'switch',
    dpid: '0103',
    controller: 'ryu1',
    tags: [],
  }],
  links: [{
    source: 0,
    target: 1,
    type: 's2s',
  }, {
    source: 1,
    target: 3,
    type: 's2s',
  }, {
    source: 0,
    target: 2,
    type: 's2h',
  }],
  level: 0,
  filter: [],
  select: [],
  searchNode: '',
  tag: ''
};


export default (state = Immutable(initalState), action) => {
  switch (action.type) {
    case 'GET_MOCK_DATA':
      Topo.setData({
        nodes: initalState.nodes,
        links: initalState.links,
      })
      return state.merge(initalState);
    case 'ADD_NODE':
      Topo.addNode(action.payload);
      return state.update("nodes", d => {
        return d.concat(action.payload);
      });

    case 'DEL_NODE':
      return state.update("nodes", d => {
        return d.slice(0, d.length - 1);
      });
    case 'ADD_LINK':
      return state.update("links", d => {
        return _.uniqWith(d.concat(action.payload), _.isEqual);
      });
    case 'DEL_LINK':
      return state.update('links', links =>
        links.filter(link => !(link === action.payload) )
      );
    case 'SEARCH_NODE':
      return state.set('searchNode', action.payload);
    case 'TAG_CHANGE':
      return state.set('tag', action.payload);
    case 'LEVEL_CHANGE':
      return state.set('level', action.payload);
    case 'UPDATE_NODE':
      return state.update('nodes', d => action.payload);
    default:
      return state
  }
}
