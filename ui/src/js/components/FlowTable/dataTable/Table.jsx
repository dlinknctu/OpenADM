var React = require('react');
var TableHeader = require('./TableHeader.jsx');
var TableRowContainer = require('./TableRowContainer.jsx');
var _ = require('underscore');

var Table = React.createClass({
    getDefaultProps: function(){
      return{
        "data": [],
        "columns": [],
        "enableInfiniteScroll": false,
        "nextPage": null,
        "hasMorePages": false,
        "useFixedHeader": false,
        "useFixedLayout": true,
        "infiniteScrollSpacerHeight": null,
        "bodyHeight": null,
        "tableHeading": "",
        "sortAscendingClassName": "sort-ascending",
        "sortDescendingClassName": "sort-descending"
      }
    },
    render: function() {
      //console.log("dataTable=" + this.props.data);
      var that = this;

      var nodes = null;

      nodes = this.props.data.map(function(row, index){
          return (
            <TableRowContainer sortAscendingClassName={that.props.sortAscendingClassName}
                               sortDescendingClassName={that.props.sortDescendingClassName}
                               data={row}
                               columnMetadata={that.props.columnMetadata}
                               key={index}
                               columns={that.props.columns}
                               uniqueId={_.uniqueId("grid_row")} />
          );
      });
      

      var gridStyle = null;
      var tableStyle = {
        width: "100%",
        "borderCollapse": "collapse",
        "borderRadius": "5px",
        "borderColor": "grey",
        "borderSpacing":"0"
      };

      if(this.props.useFixedLayout)
      {
        tableStyle.tableLayout = "fixed";
      }

      var infiniteScrollSpacerRow = null;
      if (this.props.enableInfiniteScroll) 
      {
        // If we're enabling infinite scrolling, we'll want to include the max height of the grid body + allow scrolling.
        gridStyle = {
          "position": "relative",
          "overflowY": "scroll",
          "height": this.props.bodyHeight + "px",
          "width": "100%"
        };

        // Only add the spacer row if the height is defined.
        if (this.props.infiniteScrollSpacerHeight && this.props.hasMorePages) {
          var spacerStyle = {
            "height": this.props.infiniteScrollSpacerHeight + "px"
          };

          infiniteScrollSpacerRow = React.createElement("tr", {style: spacerStyle});
        }
      }


      //construct the table heading component
      var tableHeading = (
          <TableHeader columns={this.props.columns}
                       changeSort={this.props.changeSort}
                       sortColumn={this.props.sortColumn}
                       sortAscending={this.props.sortAscending}
                       sortAscendingClassName={this.props.sortAscendingClassName}
                       sortDescendingClassName={this.props.sortDescendingClassName}
                       columnMetadata={this.props.columnMetadata}
          />
      );

      //check to see if any of the rows have children... if they don't wrap everything in a tbody so the browser doesn't auto do this
      nodes = React.createElement("tbody", null, nodes, infiniteScrollSpacerRow)
      
      var pagingContent = "";
      if(this.props.showPager)
      {
        var pagingStyles = {
            padding : "0",
            backgroundColor: "#EDEDED",
            border: "0",
            color: "#222",
            fontFamily:"Arial"
          };

        pagingContent = (
          <tbody>
            <tr>
              <td colSpan={this.props.columns.length} style={pagingStyles} className={"footer-container"}>
                {this.props.pagingContent}
              </td>
            </tr>
          </tbody>
        );
      }

      // If we have a fixed header, split into two tables.
      if (this.props.useFixedHeader)
      {
        tableStyle.tableLayout = "fixed";
        return (
            <div>
              <table style={tableStyle}>
                {tableHeading}
              </table>
              
              <div ref="scrollable" style={gridStyle}>
                <table style={tableStyle}>
                  {nodes}
                  {pagingContent}
                </table>
              </div>
            </div>
        );
      }

      return(
          <div ref="scrollable" style={gridStyle}>
            <table style={tableStyle}>
              {tableHeading}
              {nodes}
              {pagingContent}
            </table>
          </div>
      );  
    }
});

module.exports = Table;
