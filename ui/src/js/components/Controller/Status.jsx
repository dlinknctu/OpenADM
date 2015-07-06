import React from 'react';
let { Table } = require('material-ui');

class Status extends React.Component {
    render() {
        let colOrder = [ 'OS', 'IP', 'CPU', 'Memory', 'ControllerType'];
        let rowData = [
            {
                OS: { content: 'ubuntu 14.04' },
                IP: { content: '140.113.215.182' },
                ControllerType: { content: 'floodlight' },
                CPU: { content: '20%' },
                Memory: { content: '- 2123/4096 -' },
            }
        ];

        let headerCols = {
          OS: { content: 'OS version', tooltip: 'SDN Domain Name' },
          IP: { content: 'IP', tooltip: 'Controller IP' },
          controllerType: { content: 'Controller Type', tooltip: 'The type of Controller' },
          CPU: { content: 'CPU (%)', tooltip: 'Controller (CPU) Loading' },
          Memory: { content: 'Memory', tooltip: 'Memory (MB)' },
        };

        return (
            <div>
                <Table
                  rowData={rowData}
                  columnOrder={colOrder}
                  headerColumns={headerCols}
                  displaySelectAll={false} />
            </div>
        );
    }
}

module.exports = Status;
