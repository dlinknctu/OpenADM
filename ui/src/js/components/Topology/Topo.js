import d3 from 'd3';
const color10 = d3.scale.category10();

let topoInstant;

class Topo {
  initalTopo(renderDom) {
    topoInstant = new nx.graphic.Topology({
      adaptive: true,
      scalable: true,
      showIcon: true,
      theme: 'blue',
      enableSmartLabel: true,
      enableSmartNode: true,
      enableGradualScaling: true,
      supportMultipleLink: true,
      autoLayout: true,
      // dataProcessor: 'nextforce',
      // layoutType: 'hierarchicalLayout',
      // nodeInstanceClass: 'ExtendedNode',
      // linkInstanceClass: 'ExtendedLink',
      nodeConfig: {
        iconType: vertex => {
          switch (vertex.get('nodeType')) {
            case 'switch':
              return 'switch';
            case 'host':
              return 'host';
            case 'wlc':
              return 'wlc';
            default:
              return 'unknown';
          }
        },
        label: vertex => {
          switch (vertex.get('nodeType')) {
            case 'switch':
              return vertex.get('dpid');
            case 'host':
              return vertex.get('mac');
            case 'wlc':
              return vertex.get('ip');
            default:
              return vertex.get('id');
          }
        },
        color: vertex => color10(vertex.get('id')),
      },
      linkConfig: {
        width: 5,
        linkType: 'curve'
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
      console.log('clickNode on', node.model().getData())
    })
    topoInstant.on('clickLink', function(topo, link) {
      console.log('clickLink on', link.model().getData())
    })
    topoInstant.on('selectNode', function(topo, nodes, ii) {
      console.log('selectNode', nodes);
    });
    topoInstant.on('clickStage', function(topo, stage) {
      console.log('clickStage', topo, stage);
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
    if (!data.x) {
      topoInstant.addNode({
        ...data,
        x: Math.random() * 200,
        y: Math.random() * 200,
      });
    } else {
      topoInstant.addNode(data);
    }
  }

  addLink(data) {
    topoInstant.addLink(data);
  }

  getTopo() {
    return topoInstant;
  }
}

const topology = new Topo();
export default topology;
