const TopoHelper = {
  /**
   * node helper use nodeType
   * @param  {object} data topology node or node object data
   * @return {object} node uid, node type
   */
  nodeSwitcher: (data) => {
    switch (data.get ? data.get('nodeType') : data.nodeType) {
      case 'switch':
        return data.get ? {
          uid: data.get('dpid'),
          nodeType: data.get('nodeType'),
        } : { uid: data.dpid, nodeType: data.nodeType, idKey: 'dpid' };
      case 'host':
        return data.get ? {
          uid: data.get('mac'),
          nodeType: data.get('nodeType'),
        } : { uid: data.mac, nodeType: data.nodeType, idKey: 'mac' };
      case 'wlc':
        return data.get ? {
          uid: data.get('ip'),
          nodeType: data.get('nodeType'),
        } : { uid: data.ip, nodeType: data.nodeType, idKey: 'ip' };
      default:
        return data.get ? {
          uid: data.get('id'),
          nodeType: 'unknown',
        } : { uid: data.id, nodeType: 'unknown', idKey: 'id' };
    }
  },
};

export default TopoHelper;
