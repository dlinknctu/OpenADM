import React from "react";
import objectAssign from "object-assign";
let { Paper } = require('material-ui');

class Module extends React.Component {

  render() {
    this.props.style.padding ? this.props.style.padding :
    objectAssign(this.props.style, {padding: "10px"})

    return (
        <Paper {...this.props}>
            <h1>{this.props.name}</h1>
            {this.props.children}
        </Paper>
    );
  }
}

export default Module;
