import React from "react";
let { Table } = require('material-ui');
let FullWidthSection = require('./FullWidthSection.jsx');

class Home extends React.Component {

    render() {

        let colOrder = [ 'name', 'controllerType', 'CPU', 'switches', 'flowEntries'];
        let rowData = [
            {
                name: { content: '工程三館' },
                controllerType: { content: 'ryu' },
                CPU: { content: '20%' },
                switches: { content: '- 23 -' },
                flowEntries: { content: '- 435 -' },
            },
            {
                name: { content: '工程四館' },
                controllerType: { content: 'floodlight' },
                CPU: { content: '44%' },
                switches: { content: '- 46 -' },
                flowEntries: { content: '- 755 -' },
            },
            {
                name: { content: '工程五館' },
                controllerType: { content: 'onos' },
                CPU: { content: '30%' },
                switches: { content: '- 34 -' },
                flowEntries: { content: '- 456 -' },
            },
        ];

        let headerCols = {
          name: { content: 'Name', tooltip: 'SDN Domain Name' },
          controllerType: { content: 'Status', tooltip: 'The type of Controller' },
          CPU: { content: 'Status', tooltip: 'Controller (CPU) Loading' },
          switches: { content: 'Switches', tooltip: 'Number of Switches' },
          flowEntries: { content: 'Flow Entries', tooltip: 'Number of Flow Entries' }
        };

        return (
            <FullWidthSection>
              <h1>SDN Domain List</h1>
              <Table
                rowData={rowData}
                columnOrder={colOrder}
                headerColumns={headerCols}
                displaySelectAll={false} />

            </FullWidthSection>
    );
  }
}
export default Home;
