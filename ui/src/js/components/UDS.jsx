require('react-grid-layout/node_modules/react-resizable/css/styles.css');
import React from "react";
let FullWidthSection = require('./FullWidthSection.jsx');
let ReactGridLayout = require('react-grid-layout');
let { Paper } = require('material-ui');

class UDS extends React.Component {

  constructor(props){
    super(props);
    this.onLayoutChange = this.onLayoutChange.bind(this);

    let ls = {};
    if (global.localStorage) {
      try {
        ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
      } catch(e) {}
    }
    console.log(ls.layout);
    this.state = {
        layout: ls.layout || []
    }
  }

  onLayoutChange(e){
    this.setState({layout: e});
    this._saveToLocalStorage();
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
        <h1>User Defined Statistics</h1>
        <ReactGridLayout layout={this.state.layout}
        margin={[10, 10]}
        onLayoutChange={this.onLayoutChange}
        className="layout"
        items={20}
        rowHeight={100}
        cols={12}>
            <Paper key={1} _grid={{ x: 3, y: 2, w: 3, h: 3, isDraggable: false}}>
                <h1>User</h1>
            </Paper>
            <Paper key={2} _grid={{ x: 3, y: 2, w: 3, h: 3}}>
                <h1>Defined</h1>
            </Paper>
            <Paper key={3} _grid={{ x: 3, y: 2, w: 3, h: 3}}>
                <h1>Statistics</h1>
            </Paper>
        </ReactGridLayout>
      </FullWidthSection>
    );
  }
}
export default UDS;
