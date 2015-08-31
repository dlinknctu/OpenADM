import React from "react";
let { Paper,Table, TableHeader ,TableRow, TableRowColumn ,TableHeaderColumn ,TableBody ,TableFooter } = require('material-ui');
let FullWidthSection = require('./FullWidthSection.jsx');

class Home extends React.Component {

    constructor(props){
        super(props);
        this.state = {
                fixedHeader: true,
                fixedFooter: true,
                stripedRows: false,
                showRowHover: false,
                selectable: true,
                multiSelectable: false,
                enableSelectAll: false,
                deselectOnClickaway: true,
        };
    }

    render() {

        return (
            <FullWidthSection>
              <Paper>
                  <Table
                    height={"100px"}
                    fixedHeader={this.state.fixedHeader}
                    fixedFooter={this.state.fixedFooter}
                    selectable={this.state.selectable}
                    multiSelectable={this.state.multiSelectable}
                    onRowSelection={this._onRowSelection}>
                    <TableHeader displaySelectAll={false}>
                      <TableRow>
                        <TableHeaderColumn colSpan="6" >
                          <h1>OpenVirteX</h1>
                        </TableHeaderColumn>
                      </TableRow>
                      <TableRow>
                        <TableHeaderColumn>Name</TableHeaderColumn>
                        <TableHeaderColumn>IP</TableHeaderColumn>
                        <TableHeaderColumn>Name of VN</TableHeaderColumn>
                        <TableHeaderColumn>CPU Loading</TableHeaderColumn>
                        <TableHeaderColumn>Gateway IP</TableHeaderColumn>
                        <TableHeaderColumn>Gateway mac</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      displayRowCheckbox={false}
                      deselectOnClickaway={this.state.deselectOnClickaway}
                      showRowHover={this.state.showRowHover}
                      stripedRows={this.state.stripedRows}>
                    <TableRow>
                        <TableRowColumn>OVX</TableRowColumn>
                        <TableRowColumn>xxx.xxx.xxx.xxx</TableRowColumn>
                        <TableRowColumn>5</TableRowColumn>
                        <TableRowColumn>25%</TableRowColumn>
                        <TableRowColumn>xxx.xxx.xxx.xxx.xxx</TableRowColumn>
                        <TableRowColumn>xx:xx:xx:xx:xx:xx</TableRowColumn>
                      </TableRow>
                    </TableBody>
                  </Table>
              </Paper>
              <Paper>
                  <Table
                    height={"300px"}
                    fixedHeader={this.state.fixedHeader}
                    fixedFooter={this.state.fixedFooter}
                    selectable={this.state.selectable}
                    multiSelectable={this.state.multiSelectable}
                    onRowSelection={this._onRowSelection}>
                    <TableHeader displaySelectAll={false}>
                      <TableRow>
                        <TableHeaderColumn colSpan="6" >
                          <h1>Virtual Network</h1>
                        </TableHeaderColumn>
                      </TableRow>
                      <TableRow>
                        <TableHeaderColumn>Name</TableHeaderColumn>
                        <TableHeaderColumn>IP</TableHeaderColumn>
                        <TableHeaderColumn>Name of switch</TableHeaderColumn>
                        <TableHeaderColumn>CPU Loading</TableHeaderColumn>
                        <TableHeaderColumn>T-ID</TableHeaderColumn>
                        <TableHeaderColumn>VG mac</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      displayRowCheckbox={false}
                      deselectOnClickaway={this.state.deselectOnClickaway}
                      showRowHover={this.state.showRowHover}
                      stripedRows={this.state.stripedRows}>
                      <TableRow>
                        <TableRowColumn>Default</TableRowColumn>
                        <TableRowColumn>xxx.xxx.xxx.xxx</TableRowColumn>
                        <TableRowColumn>5</TableRowColumn>
                        <TableRowColumn>25%</TableRowColumn>
                        <TableRowColumn>1</TableRowColumn>
                        <TableRowColumn>xx:xx:xx:xx:xx:xx</TableRowColumn>
                      </TableRow>
                      <TableRow>
                        <TableRowColumn>Guest</TableRowColumn>
                        <TableRowColumn>xxx.xxx.xxx.xxx</TableRowColumn>
                        <TableRowColumn>5</TableRowColumn>
                        <TableRowColumn>25%</TableRowColumn>
                        <TableRowColumn>1</TableRowColumn>
                        <TableRowColumn>xx:xx:xx:xx:xx:xx</TableRowColumn>
                      </TableRow>
                      <TableRow>
                        <TableRowColumn>Student</TableRowColumn>
                        <TableRowColumn>xxx.xxx.xxx.xxx</TableRowColumn>
                        <TableRowColumn>10</TableRowColumn>
                        <TableRowColumn>55%</TableRowColumn>
                        <TableRowColumn>2</TableRowColumn>
                        <TableRowColumn>xx:xx:xx:xx:xx:xx</TableRowColumn>
                      </TableRow>
                      <TableRow>
                        <TableRowColumn>Employee</TableRowColumn>
                        <TableRowColumn>xxx.xxx.xxx.xxx</TableRowColumn>
                        <TableRowColumn>10</TableRowColumn>
                        <TableRowColumn>30%</TableRowColumn>
                        <TableRowColumn>2</TableRowColumn>
                        <TableRowColumn>xx:xx:xx:xx:xx:xx</TableRowColumn>
                      </TableRow>
                    </TableBody>
                  </Table>
              </Paper>
            </FullWidthSection>
    );
  }
}
export default Home;
