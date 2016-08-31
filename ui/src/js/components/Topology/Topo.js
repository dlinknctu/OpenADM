/* eslint-disable no-underscore-dangle,  */
import { scaleOrdinal, schemeCategory10 } from 'd3';
import Helper from '../../utils/TopoHelper';
import { keyMap } from '../../constant/moduleMapping';

const nx = global.nx;
const color10 = scaleOrdinal(schemeCategory10);
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
        width: vertex => ((vertex.get('linkType') === 's2s') ? 6 : 4),
        linkType: 'curve',
        style: vertex => ((vertex.get('linkType') !== 's2s') ?
          { 'stroke-dasharray': '1 , 1' } : {}
        ),
        color: vertex => getColorWithController(vertex.get('controller')),
      },
      nodeSetConfig: {
        iconType: 'cloud',
        label: 'model.controller',
        color: vertex => getColorWithController(vertex.get('controller')),
      },
      vertexPositionGetter() {
        // if this is node, use original position
        if (this.type() === 'vertex') {
          return {
            x: nx.path(this._data, 'x') || 0,
            y: nx.path(this._data, 'y') || 0,
          };
        }
        // if this is a nodeSet, use the firNode's position
        const graph = this.graph();
        const firstVertex = graph.getVertex(this.get('nodes').slice(0).shift());

        if (firstVertex) {
          return firstVertex.position();
        }
        return {
          x: Math.random() * 500,
          y: Math.random() * 500,
        };
      },
      vertexPositionSetter(position) {
        if (this._data) {
          const x = nx.path(this._data, 'x');
          const y = nx.path(this._data, 'y');
          if (position.x !== x || position.y !== y) {
            nx.path(this._data, 'x', position.x);
            nx.path(this._data, 'y', position.y);
            return true;
          }
          return false;
        }
        return false;
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
      view(view) {
        const newView = view;
        newView.content[2].events.click = '{#_nodeClick}';
          // console.log('view ', view.content[0])
        return newView;
      },

      methods: {
        init(args) {
          this.inherited(args);
          const stageScale = this.topology().stageScale();
          this.view('label').setStyle('font-size', 14 * stageScale);
        },
        setModel(model) {
          this.inherited(model);
        },
        applyChanges() {
          // var type = $scope.getNodeTypeById(this.id());
          // if ($scope.colorTable.nodeTypes.hasOwnProperty(type)) {
          //   this.color($scope.colorTable.nodeTypes[type]);
          // }
        },
        _nodeClick(sender, event) {
          console.log('node clicked', this.id());
        },
        _dragstart(sender, event) {
          console.log('drag start', this.model().get('dpid'));
        },
      },
    });

    nx.define('ExtendedLink', nx.graphic.Topology.Link, {
      methods: {
        init(args) {
          this.inherited(args);
          // fixme: third parameter should be false
          // topo.fit(undefined, undefined, true);
        },
        setModel(model) {
          this.inherited(model);
        },
        applyChanges() {},
      },
    });

    topoInstant.on('topologyGenerated', (sender, event) => {
      topoInstant.adaptToContainer();

      // topoInstant.expandAll();
    });

    const app = new nx.ui.Application();
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
    pathLayer.ondragend = (d, a) => {
      console.log('path dragend', d, a);
    };
    topoInstant.on('keypress', (topo, e) => {
      switch (e.key) {
        case 'c':
          props.toggleModule(keyMap[e.key]);
          break;
        case 'f':
          props.toggleModule(keyMap[e.key]);
          break;
        case 's':
          props.toggleModule(keyMap[e.key]);
          break;
        case 'p':
          props.toggleModule(keyMap[e.key]);
          break;
        case 'r':
          props.resetLayout();
          break;
        case '?':
          props.toggleModule(keyMap[e.key]);
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

  delNode({ uid }) {
    topoInstant.removeNode(uid);
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
        `${linkCollection.controller}@${link[0].dpid}`,
        `${linkCollection.controller}@${link[1].dpid}`
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
/* eslint-enable no-underscore-dangle,  */
