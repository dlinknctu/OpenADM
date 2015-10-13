import React from "react";
import objectAssign from "object-assign";
let { Styles, Paper } = require('material-ui');
var ThemeManager = Styles.ThemeManager();
class Module extends React.Component {
    constructor(props){
        super(props);
    }

  render() {

    let moduleStyle = {
        "style": {
            "height": "100%",
            "width": "100%"
        }
    }
    return (
        <Paper zDepth={2} rounded={true} style={moduleStyle.style} {...this.props}>
            {this.props.children}
        </Paper>
    );
  }
}
Module.contextTypes = {
  muiTheme: React.PropTypes.object
}
export default Module;
