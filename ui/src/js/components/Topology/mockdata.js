const mockdata = {
  nodes: [
    { key: '1', x: 469, y: 410, dpid: '00:00:00:1', type: 'switch' },
    { key: '2', x: 493, y: 364, dpid: '00:00:00:2', type: 'switch' },
    { key: '3', x: 442, y: 365, dpid: '00:00:00:3', type: 'switch' },
    { key: '4', x: 467, y: 314, dpid: '00:00:00:4', type: 'switch' },
    { key: '5', x: 477, y: 248, dpid: '00:00:00:5', type: 'switch' },
    { key: '6', x: 425, y: 207, dpid: '00:00:00:6', type: 'switch' },
    { key: '7', x: 402, y: 155, dpid: '00:00:00:7', type: 'switch' },
    { key: '8', x: 369, y: 196, dpid: '00:00:00:8', type: 'switch' },
    { key: '9', x: 350, y: 148, mac: 'ab:cd:ef:gh:aa', type: 'host' },
    { key: '10', x: 539, y: 222, mac: 'ab:cd:ef:gh:bb', type: 'host' },
    { key: '11', x: 594, y: 235, mac: 'ab:cd:ef:gh:cc', type: 'host' },
    { key: '12', x: 582, y: 185, mac: 'ab:cd:ef:gh:dd', type: 'host' },
    { key: '13', x: 633, y: 200, mac: 'ab:cd:ef:gh:ee', type: 'host' },
  ],
  links: [
    { source: 0, target: 1, type: 's2s' },
    { source: 1, target: 2, type: 's2s' },
    { source: 2, target: 0, type: 's2s' },
    { source: 1, target: 3, type: 's2s' },
    { source: 3, target: 2, type: 's2h' },
    { source: 3, target: 4, type: 's2s' },
    { source: 4, target: 5, type: 's2s' },
  ],
};
export default mockdata;
