import Immutable from 'seamless-immutable';
import _ from 'lodash';
import Helper from '../utils/TopoHelper';
import Topo from '../components/Topology/Topo.js';

const initalState = {
  nodes: [],
  links: [],
  fixedNode: {},
  level: 0,
  filter: [],
  select: [],
  searchNode: '',
  tag: '',
  controllerList:[],
};


export default (state = Immutable(initalState), { type, payload }) => {
  switch (type) {
    // case 'ADD_NODE':
    //   Topo.addNode(payload);
    //   return state.update("nodes", d => {
    //     return d.concat(payload);
    //   });
    //
    // case 'DEL_NODE':
    //   return state.update("nodes", d => {
    //     return d.slice(0, d.length - 1);
    //   });
    // case 'ADD_LINK':
    //   return state.update("links", d => {
    //     return _.uniqWith(d.concat(payload), _.isEqual);
    //   });
    // case 'DEL_LINK':
    //   return state.update('links', links =>
    //     links.filter(link => !(link === payload) )
    //   );
    // case 'SEARCH_NODE':
    //   return state.set('searchNode', payload);
    // case 'TAG_CHANGE':
    //   return state.set('tag', payload);
    // case 'LEVEL_CHANGE':
    //   return state.set('level', payload);

    case 'DRAG_NODE':
      return state.update('fixedNode', d => d.merge(payload));

    case 'CLICK_NODE':
      return state;

    case 'CLICK_LINK':
      return state;

    case 'SELECT_NODE':
      return state;

    /**
     * { ip, vlan, mac, controller, type, location }
     * location: { port, dpid }
     */
    case 'ADDHOST':
      const uid = `${payload.controller}-${payload.mac}`;
      Topo.addNode({
        ...payload,
        uid,
      });
      const suid = `${payload.controller}-${payload.location.dpid}`;
      Topo.addLinkById(suid, uid, 's2h');
      return state;
    /**
     * { controller, mac }
     */
    case 'DELHOST':
      Topo.delNode({
        ...payload,
        uid: `${payload.controller}-${payload.mac}`,
      });
      return state;
    /**
     * { controller, type, dpid }
     * {controller: "waynesdn", type: "switch", dpid: "00:00:00:00:00:00:00:03"}
     */
    case 'ADDDEVICE':
      Topo.addNode({
        ...payload,
        uid: `${payload.controller}-${payload.dpid}`,
      });
      return state;
    /**
     * { controller, dpid }
     */
    case 'DELDEVICE':
      Topo.delNode({
        ...payload,
        uid: `${payload.controller}-${payload.dpid}`,
      });
      return state;
    /**
     * { controller, link: [{dpid, port},{dpid, port}]}
     */
    case 'ADDLINK':
      Topo.addLinkById(
        `${payload.controller}-${payload.link[0].dpid}`,
        `${payload.controller}-${payload.link[1].dpid}`,
        's2s'
      );
      return state;
    /**
     * { controller, link: [{dpid, port},{dpid, port}] }
     */
    case 'DELLINK':
      const ulink = payload.link.map(l => ({
        ...l,
        uid: `${payload.controller}-${l.dpid}`,
      }));
      Topo.delLinkById({
        ...payload,
        link: ulink,
      });
      return state;

    /**
     * { controller, adddevice, addlink, addhost, addport }
     */
    case 'ALL_DATA':
      const { devices, links, hosts, ports, controllers } = payload;

      const topoNodes = devices.map(d => {
        const uid = `${d.controller}-${d.dpid}`;
        return (state.fixedNode[uid]) ?
          { ...d, uid, ...state.fixedNode[uid], fixed: true } :
          { ...d, uid };
      }).concat(hosts.map(d => {
        const uid = `${d.controller}-${d.mac}`;
        return (state.fixedNode[uid]) ?
          { ...d, uid, ...state.fixedNode[uid], fixed: true } :
          { ...d, uid };
      }));

      const topolinks = links.map(l => ({
        source: `${l.controller}-${l.link[0].dpid}`,
        target: `${l.controller}-${l.link[1].dpid}`,
        linkType: 's2s',
      })).concat(
        hosts.map(h => ({
          source: `${h.controller}-${h.location.dpid}`,
          target: `${h.controller}-${h.mac}`,
          linkType: 's2s',
        }))
      );
      const topoNodeSet = controllers.map(c => ({
        name: c.controller,
        nodes: topoNodes
          .filter(d => d.controller === c.controller)
          .map(d => d.uid),
      }));
      const topoData = {
        nodes: topoNodes,
        links: topolinks,
        nodeSet: topoNodeSet,
      };
      Topo.setData(topoData);
      return state.update('controllerList',
        () => controllers.map(d => d.controller)
      );
    /**
     * { controller, mac_src, mac_dst , port_src, port_dst, ip_src, ip_dst
     * 	 protocol, ther_type, in_port, dpid }
     */
    case 'PACKET':
      return state;
    case 'ADD_MOCK_PATH':
      Topo.addMockPath(payload);
      return state;
    case 'SIMULATE_RESP':
      Topo.addPath(payload);
      return state;
    default:
      return state;
  }
};
