import Immutable from 'seamless-immutable';
import _ from 'lodash';
import Helper from '../utils/TopoHelper';
import Topo from '../components/Topology/Topo.js';

const initalState = {
  nodes: [],
  links: [],
  level: 0,
  filter: [],
  select: [],
  searchNode: '',
  tag: '',
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
    // case 'UPDATE_NODE':
    //   return state.update('nodes', d => payload);

    /**
     * { ip, vlan, mac, controller, type, location }
     * location: { port, dpid }
     */
    case 'ADDHOST':
      if (payload.length) {
        Topo.insertData({
          nodes: payload,
        });
        payload.forEach(host => {
          Topo.addLinkById(host.mac, host.location.dpid, 's2h');
        });
      }
      return state;
    /**
     * { controller, mac }
     */
    case 'DELHOST':
      Topo.delNode(payload);
      return state;
    /**
     * { controller, type, dpid }
     * {controller: "waynesdn", type: "switch", dpid: "00:00:00:00:00:00:00:03"}
     */
    case 'ADDDEVICE':
      if (payload.length) {
        Topo.setData({
          nodes: payload,
        });
        return state.update('nodes', () => payload);
      }
      Topo.addNode(payload);
      return state.update('nodes', d => d.concat(payload));
    /**
     * { controller, dpid }
     */
    case 'DELDEVICE':
      Topo.delNode(payload);
      return state;
    /**
     * { controller, link: [{dpid, port},{dpid, port}]}
     */
    case 'ADDLINK':
      // if (payload.length) {
      //   payload.forEach(d => {
      //     Topo.addLinkById(d[0].dpid, d[1].dpid, 's2s');
      //   });
      // }
      Topo.addLinkById(payload.link[0].dpid, payload.link[1].dpid, 's2s');
      return state;
    /**
     * { controller, link: [{dpid, port},{dpid, port}] }
     */
    case 'DELLINK':
      Topo.delLinkById(payload);
      return state;

    /**
     * { controller, adddevice, addlink, addhost, addport }
     */
    case 'ALL_DATA':
      const { devices, links, hosts, ports } = payload;
      const topoNodes = devices.map(
        d => Object.assign(d, { id: `${d.controller}-${d.dpid}` })
      ).concat(hosts.map(
        d => Object.assign(d, { id: `${d.controller}-${d.mac}` })
      ));

      const topolinks = links.map(l => ({
        source: topoNodes.findIndex(n => Helper.nodeSwitcher(n).uid === l.link[0].dpid),
        target: topoNodes.findIndex(n => Helper.nodeSwitcher(n).uid === l.link[1].dpid),
      })).concat(
        hosts.map(h => ({
          source: topoNodes.findIndex(n => {
            if (n.nodeType === 'host') return false;
            return Helper.nodeSwitcher(n).uid === h.location.dpid;
          }),
          target: topoNodes.findIndex(n => {
            if (n.nodeType !== 'host') return false;
            return Helper.nodeSwitcher(n).uid === h.mac;
          }),
        }))
      );

      const topoData = {
        nodes: topoNodes,
        links: topolinks,
      };
      Topo.setData(topoData);
      return state;
    /**
     * { controller, mac_src, mac_dst , port_src, port_dst, ip_src, ip_dst
     * 	 protocol, ther_type, in_port, dpid }
     */
    case 'PACKET':
      return state;
    default:
      return state;
  }
};
