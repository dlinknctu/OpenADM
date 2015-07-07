import React from 'react';
let { List, ListItem } = require('material-ui');

class Status extends React.Component {
    render() {


        this.props.status.mem_free
        this.props.status.mem_total
        this.props.status.mem_used


        let rowData = [
            {
                name: { content: this.props.status.type },
                os: { content: this.props.status.type },
                CPU: { content: this.props.status.cpu },
                mem: { content: 'floodlight' },
                Memory: { content: '- 2123/4096 -' },
            }
        ];

        console.log(this.props.status);
        return (
            <List>
                <ListItem>Controller Type: {this.props.status.type}</ListItem>
                <ListItem>name: {this.props.status.controller}</ListItem>
                <ListItem>OS: {this.props.status.os}</ListItem>
                <ListItem>CPU: {this.props.status.cpu}</ListItem>
                <ListItem>Memory: {this.props.status.mem_used}/{this.props.status.mem_total}</ListItem>
            </List>
        );
    }
}

module.exports = Status;
