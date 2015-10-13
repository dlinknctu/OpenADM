import React from 'react';
let { FontIcon, List, ListItem, Styles } = require('material-ui');

class Status extends React.Component {
    render() {
        return (
            <List subheader="Controller Status">
              <ListItem primaryText={`Controller Type: ${this.props.status.type}`}
              rightIcon={<FontIcon className="material-icons">home</FontIcon>} />
              <ListItem primaryText={`Name: ${this.props.status.controller}`}
              rightIcon={<FontIcon className="material-icons">control_point</FontIcon>}/>
              <ListItem primaryText={`OS:${this.props.status.os}`}
              rightIcon={<FontIcon className="material-icons">computer</FontIcon>}/>
              <ListItem primaryText={`CPU: ${this.props.status.cpu}`}
              rightIcon={<FontIcon className="material-icons">select_all</FontIcon>}/>
              <ListItem primaryText={`Memory: ${this.props.status.mem_used}/${this.props.status.mem_total}`}
              rightIcon={<FontIcon className="material-icons">memory</FontIcon>}/>
              <ListItem primaryText={`Memory Free: ${this.props.status.mem_free}`}
              rightIcon={<FontIcon className="material-icons" color={Styles.Colors.blue500}>memory</FontIcon>} />
            </List>
        );
    }
}

Status.defaultProps = {
    status: {
        type: "0",
        os: "0",
        cpu: "0",
        mem_used: "0",
        mem_total: "0",
        mem_free: "0"
    }
}

module.exports = Status;
