var React = require('react');
var Accordion = require('./Accordion.jsx');
var Selector = require('./Selector.jsx');
var _ = require('underscore');

var TableSettings = React.createClass({
	getDefaultProps: function(){
        return {
            "columns": [],
            "columnMetadata": [],
            "selectedColumns": [],
            "resultsPerPage": 0,
            "openFlowVersion": 1.0, 
        };
    },
    getInitialState: function(){
        return {
            openTitle:[],
            lastHighlightVal:""
        }
    },
    setPageSize: function(event){
        var value = parseInt(event.target.value, 10);
        this.props.setPageSize(value);
    },
    handleChange: function(){
    	if(event.target.checked === true && _.contains(this.props.selectedColumns, event.target.dataset.name) === false){
    		// the column is unchecked to checked,
            this.props.selectedColumns.push(event.target.dataset.name);
            this.props.setColumns(this.props.selectedColumns);
        } 
        else {
            /* redraw with the selected columns minus the one just unchecked */
            this.props.setColumns(_.without(this.props.selectedColumns, event.target.dataset.name));
        }
    },

    setAccordionOpen: function(val){
        var columnType = ["in_", "out_", "dl_", "nw_", "_id","cookie", "timeout", "eth_", "vlan", "ip_", "ipv4_", "tcp_", "udp_", "sctp_", "icmpv4_", "arp_", "ipv6_", "icmpv6_", "mpls_"];
        
        var title;
        for(var i = 0; i < columnType.length; ++i){
            if( val.indexOf(columnType[i]) != -1 ){
                var type = columnType[i].split("_");
                title = type[0]? type[0]: type[1];
                break;
            }
            if(i == columnType.length - 1)
                title = "mixin";
        }
        if(this.state.lastHighlightVal!= ""){
            var last = this.state.lastHighlightVal;
            this.refs[last].getDOMNode().style.color= "black";
            this.refs[last].getDOMNode().style.fontWeight= "normal";
        }
        this.setState({lastHighlightVal: val},function(){
            this.refs[val].getDOMNode().style.color= "#1f3d99";
            this.refs[val].getDOMNode().style.fontWeight= "bold";
        });

        if(_.contains(this.state.openTitle, title) === false){
            var openTitleList = this.state.openTitle; 
            openTitleList.push(title);
            this.setState({openTitle: openTitleList});
        }

    },
    getCheckBoxSecton: function(col){
        var isChecked = _.contains(this.props.selectedColumns, col);

        var meta  = _.findWhere(this.props.columnMetadata, {columnName: col});
        var displayName = col;  // default display name

        // if col has its display name
        if (typeof meta !== "undefined" && typeof meta.displayName !== "undefined" && meta.displayName != null) {
          displayName = meta.displayName;
        }

        var style = {
            "float": "left", 
            width: (this.props.openFlowVersion === 1.0)? "20%" : "50%"
        };
        return (
            <div style={style}>
                <input type={"checkbox"} name={"check"} onChange={this.handleChange} checked={isChecked} data-name={col} key={"check"+ col}/>
                <span ref={col}>{" " + displayName}</span>
            </div>
        );
    },
    getAccordionOpen: function(title){
        var isOpen = false;

        if(_.contains(this.state.openTitle, title) === true){
            isOpen = "section open";
        }
        return isOpen;
    },
    removeOpenList: function(isOpen, title){
        if(isOpen) {
            var newOpenList = _.without(this.state.openTitle, title);
            this.setState({
                openTitle: newOpenList
            });
        }
    },
	render: function() {
		var that = this;
		var nodes = [];
		if(this.props.openFlowVersion === 1.0){
			nodes = this.props.columns.map(function(col, index){
                return that.getCheckBoxSecton(col);
			});
		}
		else if(this.props.openFlowVersion === 1.3) {
            var columnType = ["in_", "out_", "dl_", "nw_", "_id","cookie", "timeout", "eth_", "vlan", "ip_", "ipv4_", "tcp_", "udp_", "sctp_", "icmpv4_", "arp_", "ipv6_", "icmpv6_", "mpls_"];

            var that = this;
            var restCol = that.props.columns;
            nodes = columnType.map(function(colType, index){

                var innerNodes = [];
                
                for(var i = that.props.columns.length-1; i >= 0; --i){
                    var col = that.props.columns[i].toLowerCase();
                    if (col.indexOf(colType.toLowerCase()) >= 0) {
                        innerNodes.push(that.getCheckBoxSecton(that.props.columns[i]));
                        restCol = _.without(restCol, that.props.columns[i]);
                    }  
                }
                var type = colType.split("_");
                var title = type[0]? type[0]: type[1];
                var isOpen = that.getAccordionOpen(title);
                return (
                    <div style={{"float": "left", width: "25%"}}>
                        <Accordion title={title} isOpen={isOpen} 
                                   removeOpenList={that.removeOpenList}>   
                            {innerNodes}
                        </Accordion>
                    </div>
                );
            });
            
            // mixin columns
            var innerNodes = [];
            for(var i = 0; i < restCol.length; ++i) {
                innerNodes.push(that.getCheckBoxSecton(restCol[i]));
            }
            var isOpen = this.getAccordionOpen("mixin");

            nodes.push(
                <div style={{"float": "left", width: "25%"}}>
                    <Accordion title={"mixin"} isOpen={isOpen} 
                               removeOpenList={that.removeOpenList}>   
                        {innerNodes}
                    </Accordion>
                </div>
            );

		}
        var selectStyle={
              maxHeight: "20px",
              marginTop: "0",
              height: "38px",
              padding: "0",
              backgroundColor: "#fff",
              border: "1px solid #D1D1D1",
              borderRadius: "4px",
              boxShadow: "none",
              boxSizing: "border-box",
              fontSize: "11pt"
        };
		var setPageSize = (
				<div>
					<label htmlFor={"maxRows"}>
					{"Rows per page : "}
					<select onChange={this.setPageSize} value={this.props.resultsPerPage} style={selectStyle}>
						<option value={"5"}>5</option>
						<option value={"10"}>10</option>
						<option value={"25"}>25</option>
						<option value={"50"}>50</option>
						<option value={"100"}>100</option>
					</select>
					</label>
				</div>
			);

		return (
			<div style={{backgroundColor: "#FFF", border: "2px solid #DDD", color: "#222", padding: "10px", marginBottom: "10px", fontFamily: "Arial"}} >
                <div style={{"float": "right", marginTop: "-70px", marginRight: "-10px","width": "25%"}}>
                   <Selector columns={this.props.columns} focusCheckBox={this.setAccordionOpen}/>
                </div>
				<div style={{clear: "both", display: "table", width: "100%", borderBottom: "1px solid #EDEDED", marginBottom: "10px"}} >
				    {nodes}
				</div>
				{setPageSize}
			</div>
		);
	}
});

module.exports = TableSettings;