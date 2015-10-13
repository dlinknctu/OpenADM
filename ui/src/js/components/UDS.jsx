// require('./uds.less');
import React from "react";
var ReactGridLayout = require('react-grid-layout');
import Module from "./Module.jsx";
import FlowTable from "./FlowTable/FlowTable.jsx";
let FullWidthSection = require('./FullWidthSection.jsx');
let { Paper } = require('material-ui');

class UDS extends React.Component {

  constructor(props){
    super(props);
    var ls = {};
    if (global.localStorage) {
      try {
        ls = JSON.parse(global.localStorage.getItem('gridLayout')) || {};
      } catch(e) {}
    }
    this.state = {
        layout: ls.layout || []
    }
  }

  componentDidUpdate(prevProps, prevState) {
      this._saveToLocalStorage();
  }
    _saveToLocalStorage() {
      if (global.localStorage) {
        global.localStorage.setItem('gridLayout', JSON.stringify({
          layout: this.state.layout
        }));
      }
    }

    onLayoutChange(layout) {
      this.setState({layout: layout});
    }

  render() {
    let styles = {
        "root": { "position": "absolute", "height": "100%", "width": "100%", "marginTop": "65px" },
        "svg": { "height": "99vh", "width": "100%", "backgroundColor": "#ffd" }
    };

    return (
        <div style={styles.root}>
            <ReactGridLayout
                className="gridlayout"
                cols={12}
                rowHeight={30}
                verticalCompact={false}
                layout={this.state.layout}
                onLayoutChange={this.onLayoutChange.bind(this)}>
              <div className="module" key={1} _grid={{w: 2, h: 3, x: 0, y: 0}}>
                <span className="text">1</span>
              </div>
              <div className="module" key={2} _grid={{w: 2, h: 3, x: 2, y: 0}}>
                <span className="text">2</span></div>
            </ReactGridLayout>
            <Paper style={{ width: '99%', marginLeft:"10", padding:"10", bottom: "10px", position: "absolute"}}>
              <h2>Flow Table</h2>
              <FlowTable openFlowVersion={1.0}
                         filter={0}/>
            </Paper>
            <svg style={styles.svg}>topology</svg>
        </div>

    );
  }
}
export default UDS;
