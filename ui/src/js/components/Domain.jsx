require('react-grid-layout/node_modules/react-resizable/css/styles.css');
require('./Domain.less');
let React = require('react');
let { RaisedButton, Paper, Styles } = require('material-ui');
let FullWidthSection = require('./FullWidthSection.jsx');
let ReactGridLayout = require('react-grid-layout');
let { Spacing, Typography } = Styles;
let Topology = require('./Topology/Topology.jsx');
let Status = require('./Controller/Status.jsx');
let FlowTable = require('./FlowTable/FlowTable.jsx');
let Firewall = require('./Firewall/Firewall.jsx');
let config =  require('../../../config/config.json');
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
        console.log('Catch error: ', e);
      }
    }

    this.state = {
        layout: ls.layout ||[],
        focusNode: { id: "none", type: 'none' },
        controllerStatus: {},
        evnetSource: new EventSource(`${config.OpenADMCoreURL}subscribe`)
    }
  }

  componentDidMount() {
    this.state.evnetSource.addEventListener('controller', e => {
        this.handleControllerStatus(JSON.parse(e.data));
    });
  }

  onLayoutChange(e){
    this.setState({ layout: e });
    this._saveToLocalStorage();
  }

  _saveToLocalStorage() {
      if (global.localStorage) {
        global.localStorage.setItem('rgl-7', JSON.stringify({
          layout: this.state.layout
        }));
      }
  }

  handleChagneFocusID(node){
    if (node.type === 'switch'){
        this.setState({
            focusNode: {
                id: node.dpid,
                type: node.type
            }
        });
    }
  }

  handleControllerStatus(status){

    this.setState({
        controllerStatus: status
    });
  }

  render() {
    var dpid = "none";
    if (this.state.focusNode.type === 'switch' && this.state.focusNode.id !== "none"){
        dpid = this.state.focusNode.id;
    }
    let styles = {
        "root": { "position": "absolute", "height": "99vh", "width": "100%", "marginTop": "65px" },
    };
    return (
      <div style={styles.root}>
          <ReactGridLayout
              cols={12}
              rowHeight={30}
              verticalCompact={false}
              layout={this.state.layout}
              onLayoutChange={this.onLayoutChange.bind(this)}
              className="gridlayout">
            <div className="module" key={1}  _grid={{w: 2, h: 13, x: 8, y: 0, minH: 13, minW: 2 }}>
                <Status status={this.state.controllerStatus}/>
            </div>
            <Topology evnetSource={this.state.evnetSource}
                  onChagneFocusID={this.handleChagneFocusID.bind(this)} />
          </ReactGridLayout>
          <Paper style={{ zIndex: 3, width: '99%', marginLeft:"10", padding:"10", bottom: "30px", position: "fixed"}}>
            <h2>Flow Table</h2>
            <FlowTable openFlowVersion={1.0}
                       filter={dpid}/>
          </Paper>
      </div>
    );
  }
}

export default Domain;
