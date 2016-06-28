import d3 from 'd3';
import Helper from '../../utils/TopoHelper';

const color10 = d3.scale.category10();
// save controller to choose color
let clist = [];
const getColorWithController = cname => color10(clist.indexOf(cname));

let topoInstant;

class Topo {
  initalTopo(renderDom) {
    topoInstant = new nx.graphic.Topology({
      // style: {
      //   'background-color': '#EEEEEE',
      // },
      adaptive: true,
      scalable: true,
      showIcon: true,
      enableSmartLabel: true,
      enableSmartNode: true,
      enableGradualScaling: true,
      supportMultipleLink: true,
      identityKey: 'uid',
      // autoLayout: true,
      dataProcessor: 'force',
      // layoutType: 'hierarchicalLayout',
      // nodeInstanceClass: 'ExtendedNode',
      // linkInstanceClass: 'ExtendedLink',
      nodeConfig: {
        iconType: vertex => vertex.get('nodeType'),
        label: vertex => Helper.nodeSwitcher(vertex).uid,
        color: vertex => getColorWithController(vertex.get('controller')),
      },
      linkConfig: {
        width: vertex => {
          if (vertex.get('linkType') === 's2s')
            return 6;
          return 4;
        },
        linkType: 'curve',
        style: vertex => {
          if (vertex.get('linkType') !== 's2s') {
            return { 'stroke-dasharray': '1 , 1' };
          }
        },
        color: vertex => getColorWithController(vertex.get('controller')),
      },
      nodeSetConfig: {
        iconType: 'cloud',
        label: 'model.controller',
        color: vertex => getColorWithController(vertex.get('controller')),
      },
      vertexPositionGetter: function() {
        // if this is node, use original position
        if (this.type() == "vertex") {
          return {
            x: nx.path(this._data, 'x') || 0,
            y: nx.path(this._data, 'y') || 0
          };
        } else {
          // if this is a nodeSet, use the firNode's position
          var graph = this.graph();
          var firstVertex = graph.getVertex(this.get('nodes').slice(0).shift());

          if (firstVertex) {
            return firstVertex.position();
          } else {
            return {
              x: Math.random() * 500,
              y: Math.random() * 500
            }
          }
        }
      },
      vertexPositionSetter: function(position) {
        if (this._data) {
          var x = nx.path(this._data, 'x');
          var y = nx.path(this._data, 'y');
          if (position.x !== x || position.y !== y) {
            nx.path(this._data, 'x', position.x);
            nx.path(this._data, 'y', position.y);
            return true;
          } else {
            return false;
          }
        }
      },
      // layoutType: 'WorldMap',
      // layoutConfig: {
      //   longitude: 'model.longitude',
      //   latitude: 'model.latitude',
      //   worldTopoJson: 'js/world.js',
      // },
      // tooltipManagerConfig: {
      //   nodeTooltipContentClass: 'MyNodeTooltip'
      // },
    });


    nx.define('ExtendedNode', nx.graphic.Topology.Node, {
      view: function(view) {
        view.content[2].events.click = "{#_nodeClick}"
          // console.log('view ', view.content[0])
        return view;
      },

      'methods': {
        init: function(args) {
          this.inherited(args);
          var stageScale = this.topology().stageScale();
          this.view('label').setStyle('font-size', 14 * stageScale);
        },
        setModel: function(model) {
          this.inherited(model);
        },
        applyChanges: function() {
          // var type = $scope.getNodeTypeById(this.id());
          // if ($scope.colorTable.nodeTypes.hasOwnProperty(type)) {
          //   this.color($scope.colorTable.nodeTypes[type]);
          // }
        },
        _nodeClick: function(sender, event) {
          console.log('node clicked', this.id());
        },
        _dragstart: function(sender, event) {
          console.log('drag start', this.model().get('dpid'));
        },
      }
    });

    nx.define('ExtendedLink', nx.graphic.Topology.Link, {
      methods: {
        init: function(args) {
          this.inherited(args);
          // fixme: third parameter should be false
          // topo.fit(undefined, undefined, true);
        },
        setModel: function(model) {
          this.inherited(model);
        },
        applyChanges: function() {}
      }
    });

    topoInstant.on('topologyGenerated', (sender, event) => {
      topoInstant.adaptToContainer();

      // topoInstant.expandAll();
    });

    var app = new nx.ui.Application();
    app.on('resize', () => {
      topoInstant.adaptToContainer();
    });
    app.container(renderDom);
    topoInstant.attach(app);
    window.topo = topoInstant;
  }

  bindEvent(props) {
    topoInstant.on('clickNode', (topo, node) => {
      props.clickNode(node.model().getData());
    });
    topoInstant.on('clickLink', (topo, link) => {
      props.clickLink(link.model().getData());
    });
    topoInstant.on('selectNode', (topo, nodes) => {
      props.selectNode(nodes.model().getData());
    });

    topoInstant.on('dragNodeEnd', (topo, target) => {
      props.dragNode({
        [target.id()]: target.position(),
      });
    });
    const pathLayer = topoInstant.getLayer('paths');
    pathLayer.ondragend = (d,a) => {
      console.log('path dragend', d, a);
    };
    topoInstant.on('keypress', (topo, e) => {
      switch (e.code) {
        case 'KeyC':
          props.togglePanel('ControllerStatus');
          break;
        case 'KeyF':
          props.togglePanel('Flowtable');
          break;
        case 'KeyS':
          props.togglePanel('SettingContainer');
          break;
        case 'KeyP':
          props.togglePanel('PortStatus');
          break;
        case 'KeyR':
          props.resetLayout();
          break;
        default:
          return;
      }
    });
  }

  setData(data) {
    clist = data.nodeSet.map(d => d.controller);
    topoInstant.data(data);
  }

  insertData(data) {
    const newNodes = data.nodes.map(d => ({
      ...d,
      x: Math.random() * 200,
      y: Math.random() * 200,
    }));

    topoInstant.insertData({
      ...data,
      nodes: newNodes,
    });
  }

  addNode(data) {
    if (!Array.isArray(data) && !data.x) {
      topoInstant.addNode({
        ...data,
        x: Math.random() * 200,
        y: Math.random() * 200,
      });
    } else {
      topoInstant.addNode(data);
    }
  }

  delNode(data) {
    const nodeId = topoInstant.data().nodes.findIndex(node => node.uid === data.uid);
    topoInstant.removeNode(nodeId);
  }

  addLinkById(source, target, linkType) {
    topoInstant.addLink({ source, target, linkType });
  }

  delLinkById({ link }) {
    const linkIds = this.getLinksByNodeUid(link[0].uid, link[1].uid);

    linkIds.forEach(linkId => {
      topoInstant.deleteLink(linkId);
    });
  }

  addPath(linkCollection = {}) {
    if (linkCollection.path && !linkCollection.path.length) {
      return;
    }
    if (linkCollection.length === 0) {
      return;
    }
    const pathLayer = topoInstant.getLayer('paths');
    const links = linkCollection.path.map(link => {
      const linkIds = this.getLinksByNodeUid(
        `${linkCollection.controller}-${link[0].dpid}`,
        `${linkCollection.controller}-${link[1].dpid}`
      );
      return topoInstant.getLink(linkIds[0]);
    });

    const path1 = new nx.graphic.Topology.Path({
      links,
      arrow: 'end',
    });
    pathLayer.addPath(path1);
  }

  clearAllPath() {
    const pathLayer = topoInstant.getLayer('paths');
    pathLayer.clear();
  }
  /**
   * [getLinksByNodeUid description]
   * @param  {[type]} sourceId   [description]
   * @param  {[type]} targetId   [description]
   * @param  {[type]} controller [description]
   * @return {[type]}            [description]
   */
  getLinksByNodeUid(sourceUid, targetUid) {
    const linkClasses = topoInstant.getLinksByNode(sourceUid, targetUid);
    return Object.keys(linkClasses);
  }

  getTopo() {
    return topoInstant;
  }
}

const topology = new Topo();
export default topology;
