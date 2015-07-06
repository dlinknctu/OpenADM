var React = require('react');
var _ = require('underscore');

var TableRow = React.createClass({
    getDefaultProps: function(){
      return {
        "data": {},
        "columns" : [],
        "columnMetadata": null,
      }
    },
    render: function() {
        var that = this;
        var columnStyles = {
            padding: "5px",
            height: "20px",
            backgroundColor: "#FFF",
            borderTopColor: "#DDD",
            color: "#222",
            fontFamily: "Arial",
            fontSize:"11pt",
            borderBottom: "1px solid #E1E1E1",
            textAlign: "left"
        };
        var resultKeys = _.keys(this.props.data);
        var resultData = this.props.data;
       
        //check is there data lost or not
        for(var i = 0; i < this.props.columns.length; ++i){
            
            if(!_.contains(resultKeys, this.props.columns[i])){
                var element= new Object;
                element[this.props.columns[i]] = "";
                _.extend(resultData, element);
            }
        }
        var data = _.pairs(this.props.columns.length === 0 ? resultData : _.pick(resultData, this.props.columns))

        var nodes = data.map(function(col, index) {

            var returnValue = null;
            var meta = _.findWhere(that.props.columnMetadata, {columnName: col[0]});


            if (that.props.columnMetadata !== null && that.props.columnMetadata.length > 0 && typeof meta !== "undefined"){

              var colData = (typeof meta === 'undefined' || typeof meta.customComponent === 'undefined' || meta.customComponent === null) ? col[1] : React.createElement(meta.customComponent, {data: col[1], rowData: that.props.data});

              returnValue = (meta == null ? returnValue : React.createElement("td", {className: meta.cssClassName, key: index, style: columnStyles}, colData));
            }

            return returnValue || (React.createElement("td", {key: index, style: columnStyles}, col[1]));
        });

        //this is kind of hokey - make it better
        var className = "standard-row";

        return (
            <tr className={className}>
                {nodes}
            </tr>
        );
    }
});

module.exports = TableRow;
