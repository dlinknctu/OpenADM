import React from "react";
import objectAssign from "object-assign";
let { Styles, Paper } = require('material-ui');
var ThemeManager = Styles.ThemeManager();



class Module extends React.Component {


  render() {
    var textColor = this.context.muiTheme.palette.textColor;
    this.props.style.padding ? this.props.style.padding :
    objectAssign(this.props.style, {padding: "10px"})
    return (
        <Paper {...this.props}>
            <h1 style={{"color" : textColor}}>{this.props.name}</h1>
            {this.props.children}
        </Paper>
    );
  }
}
Module.contextTypes = {
  muiTheme: React.PropTypes.object
}
export default Module;
