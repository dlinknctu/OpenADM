var React = require('react');
var TableRow = require('./TableRow.jsx');

var TableRowContainer = React.createClass({
    getDefaultProps: function(){
      return {
        "columns" : []
      };
    },
    getInitialState: function(){
        return {
           "data": {},
        }
    },
    render: function(){
        var that = this;

        if(typeof this.props.data === "undefined") {
          return <tbody></tbody>;
        }

        return (
          <TableRow data={this.props.data} 
                    columns={this.props.columns}
                    columnMetadata={this.props.columnMetadata}
                    key={this.props.uniqueId} />
        );
    }
});

module.exports = TableRowContainer;
