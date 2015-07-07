import React from 'react';
var Griddle = require('griddle-react');
var firewallTable = require('../../constants/firewall-table.json');

class Firewall extends React.Component {

    render() {
        return (
            <Griddle results={this.props.url} showFilter={true} showSettings={true}
              columns={["src", "dst", "transport_prot:port", "action"]} useFixedLayout={false}/>
        );
    }
}
Firewall.defaultProps = {
    url: firewallTable
}

module.exports = Firewall;
