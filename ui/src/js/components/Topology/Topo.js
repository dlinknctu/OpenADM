import d3 from 'd3';
import Helper from '../../utils/TopoHelper';

const color10 = d3.scale.category10();

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
      theme: 'blue',
      enableSmartLabel: true,
      enableSmartNode: true,
      enableGradualScaling: true,
      supportMultipleLink: true,
      // autoLayout: true,
      dataProcessor: 'force',
      // layoutType: 'hierarchicalLayout',
      // nodeInstanceClass: 'ExtendedNode',
      // linkInstanceClass: 'ExtendedLink',
      nodeConfig: {
        iconType: vertex => vertex.get('nodeType'),
        label: vertex => Helper.nodeSwitcher(vertex).uid,
        // color: vertex => color10(vertex.get('id')),
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
      },
      nodeSetConfig: {
        iconType: 'model.iconType',
        label: 'model.name',
      },
      // layoutType: 'WorldMap',
      //   layoutConfig: {
      //       longitude: 'model.longitude',
      //       latitude: 'model.latitude',
      //       worldTopoJson: 'js/world.js'
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

    topoInstant.on('topologyGenerated', function(sender, event) {
      topoInstant.adaptToContainer();
      topoInstant.expandAll();
    });
    topoInstant.on('clickNode', function(topo, node) {
      // console.log('clickNode on', node.model().getData())
    })
    topoInstant.on('clickLink', function(topo, link) {
      console.log('clickLink on', link.id());
    })
    topoInstant.on('selectNode', function(topo, nodes, ii) {
      // console.log('selectNode', nodes);
    });
    topoInstant.on('clickStage', function(topo, stage) {
      // console.log('clickStage', topo, stage);
    });
    topoInstant.on('pressA', function(topo, stage) {
      console.log('pressA', topo, stage);
    });
    var app = new nx.ui.Application();
    app.on('resize', function() {
      topoInstant.adaptToContainer();
    });
    app.container(renderDom);
    topoInstant.attach(app);
    window.topo = topoInstant;
  }

  setData(data) {
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
    const nodeId = topoInstant.data().nodes.findIndex(node =>
      (node.controller === data.controller) && (() => {
        const { uid, nodeType } = Helper.nodeSwitcher(node);
        return uid === data[nodeType];
      })
    );
    topoInstant.removeNode(nodeId);
  }

  // getNodeByUid(sourceId, targetId) {
  //   const nodes = topoInstant.data().nodes;
  //
  //   const source = nodes.findIndex(node => node.dpid === sourceId);
  //   const target = nodes.findIndex(node => node.dpid === targetId);
  //
  //   topoInstant.getLinksByNode(source, target);
  // }

  addLinkById(sourceId, targetId, linkType) {
    /**
     * input node_id (dpid, mac...),
     */
    const nodes = topoInstant.data().nodes;
    let source;
    let target;
    switch (linkType) {
      case 's2s':
        source = nodes.findIndex(node => node.dpid === sourceId);
        target = nodes.findIndex(node => node.dpid === targetId);
        topoInstant.addLink({ source, target, linkType });
        break;
      case 's2h':
        source = nodes.findIndex(node => node.mac === sourceId);
        target = nodes.findIndex(node => node.dpid === targetId);
        topoInstant.addLink({ source, target, linkType });
        break;
      default:
        return;
    }
  }

  delLinkById({ controller, link }) {
    const linkIds = this.getLinksByNodeUid(link[0], link[1], controller);

    Object.keys(linkIds).forEach(linkId => {
      topoInstant.deleteLink(linkId);
    });
  }

  addPath(linkCollection) {

    const pathLayer = topoInstant.getLayer('paths');
    const links = linkCollection.path.map(link => {
      const linkIds = this.getLinksByNodeUid(
        link[0].dpid,
        link[1].dpid,
        linkCollection.controller
      );
      return topoInstant.getLink(Object.keys(linkIds)[0]);
    });

    const path1 = new nx.graphic.Topology.Path({
      links,
      arrow: 'cap',
    });
    pathLayer.addPath(path1);
  }

  /**
   * [getLinksByNodeUid description]
   * @param  {[type]} sourceId   [description]
   * @param  {[type]} targetId   [description]
   * @param  {[type]} controller [description]
   * @return {[type]}            [description]
   */
  getLinksByNodeUid(sourceId, targetId, controller) {
    const nodes = topoInstant.data().nodes;

    const source = nodes.findIndex(node =>
      node.dpid === sourceId.dpid && node.controller === controller
    );
    const target = nodes.findIndex(node =>
      node.dpid === targetId.dpid && node.controller === controller
    );
    return topoInstant.getLinksByNode(source, target);
  }

  getTopo() {
    return topoInstant;
  }
}

const topology = new Topo();
export default topology;
