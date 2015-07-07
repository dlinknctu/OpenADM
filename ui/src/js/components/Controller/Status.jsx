import React from 'react';
let { List, ListItem } = require('material-ui');

class Status extends React.Component {
    render() {
        return (
            <List>
                <ListItem>Controller Type: {this.props.status.type}</ListItem>
                <ListItem>name: {this.props.status.controller}</ListItem>
                <ListItem>OS: {this.props.status.os}</ListItem>
                <ListItem>CPU: {this.props.status.cpu}</ListItem>
                <ListItem>
                    Memory{this.props.status.mem_used}/{this.props.status.mem_total}
                </ListItem>
                <ListItem>Memory Free: {this.props.status.mem_free}</ListItem>
            </List>
        );
    }
}

module.exports = Status;
