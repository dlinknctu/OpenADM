var React = require('react');
var _ = require('underscore');

var TableHeader = React.createClass({
    getDefaultProps: function(){
        return {
           "columns":[],
           "sortColumn": "",
           "sortAscending": true,
           "sortAscendingClassName": "sort-ascending",
           "sortDescendingClassName": "sort-descending",
           "sortAscendingComponent": " ▲",
           "sortDescendingComponent": " ▼",
           "changeSort": null
        }
    },
    sort: function(event){
        // click on "th" <-- event.target.dataset.title
        // click on "span" <-- event.target.parentElement.dataset.title
        this.props.changeSort(event.target.dataset.title||event.target.parentElement.dataset.title);
    },
    render: function(){
        var that = this;
        var nodes = this.props.columns.map(function(col, index){
            var columnSort = "";
            var sortComponent = null;
            var titleStyles = null;

            if(that.props.sortColumn == col && that.props.sortAscending){
                columnSort = that.props.sortAscendingClassName;
                sortComponent = that.props.sortAscendingComponent;
            }  else if (that.props.sortColumn == col && that.props.sortAscending === false){
                columnSort += that.props.sortDescendingClassName;
                sortComponent = that.props.sortDescendingComponent;
            }

            var displayName = col;

            titleStyles = {
              backgroundColor: "#EDEDEF",
              border: "0",
              borderBottom: "1px solid #DDD",
              color: "#222",
              padding: "5px",
              cursor: "pointer",
              textAlign: "left",
              height:"25px",
              fontFamily:"Arial"
            
            }

            return (
              <th onClick={that.sort} data-title={col} className={columnSort} key={displayName} style={titleStyles}>
                {displayName}
                {sortComponent}
              </th>
            );
        });


        return(
            <thead>
              <tr style={this.titleStyles}>
                {nodes}
              </tr>
            </thead>
        );
    }
});

module.exports = TableHeader;