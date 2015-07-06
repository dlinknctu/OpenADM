require('react-grid-layout/node_modules/react-resizable/css/styles.css');

let React = require('react');
let { RaisedButton, Paper, Styles } = require('material-ui');
let FullWidthSection = require('./FullWidthSection.jsx');
let ReactGridLayout = require('react-grid-layout');
let { Spacing, Typography } = Styles;
let Module = require('./Module.jsx');
let Topology = require('./Topology/Topology.jsx')
let Status = require('./Controller/Status.jsx');
let FlowTable = require('./FlowTable/FlowTable.jsx');
let Firewall = require('./Firewall/Firewall.jsx');
let _ = require('lodash');

class Domain extends React.Component {

  constructor(props){
    super(props);
    this.onLayoutChange = this.onLayoutChange.bind(this);

    let ls = {};
    if (global.localStorage) {
      try {
        ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
      } catch(e) {
        console.log('error: ', e);
      }
    }

    this.state = {
        layout: ls.layout ||[]
    }
    console.log('default state', this.state.layout);
  }

  componentDidMount() {

  }

  onLayoutChange(e){
    // this.setState({ layout: e });
    // this._saveToLocalStorage();
  }

  _saveToLocalStorage() {
      if (global.localStorage) {
        global.localStorage.setItem('rgl-7', JSON.stringify({
          layout: this.state.layout
        }));
      }
  }

  render() {

    return (
      <FullWidthSection>
        <h1>Module</h1>
        <ReactGridLayout layout={this.state.layout}
                         margin={[10, 10]}
                         padding={10}
                         onLayoutChange={this.onLayoutChange}
                         className="layout"
                         autoSize={true}
                         rowHeight={100}
                         cols={12}
                          >
            <Module key={0} name="Topology"
            _grid={{ x: 0, y: 0, w: 4, h: 4, minW: 4, minH:4, isDraggable: false }}>
                <Topology />
            </Module>
            <Module key={1} name="Controller Status"
            _grid={{ x: 4, y: 0, w: 4, h: 3}}>
                <Status />
            </Module>
            <Module key={2} name="FlowTable"
            _grid={{ x: 0, y: 4, w: 12, h:4, minW: 10, minH:4 }}>
                <FlowTable />
            </Module>
        </ReactGridLayout>
      </FullWidthSection>
    );
  }
}


export default Domain;
