var React = require('react');
var _ = require('underscore');

var TablePagination = React.createClass({
	getDefaultProps: function() {
		return {
			"maxPage": 0,
            "currentPage": 0,
            "nextClassName": "dataTable-next",
            "previousClassName": "dataTable-previous",
		};
	},
	pageChange: function(event){
        this.props.setPage(parseInt(event.target.value, 10)-1);
    },
	render: function() {
		var next = "";
		var previous = "";

		if(this.props.currentPage > 0)
		{
			previous = (
				<button type={"button"} onClick={this.props.previous} style={{"color": "#222", border: "none", background: "none", margin: "0 0 0 10px",fontFamily: "Arial",fontSize: "12pt",cursor:"pointer"}}>
					{"Previous"}
				</button>
			);
		}

		if(this.props.currentPage !== (this.props.maxPage - 1))
		{
			next = (
				<button type={"button"} onClick={this.props.next} style={{"color": "#222", border: "none", background: "none", margin: "0 10px 0 0",fontFamily: "Arial",fontSize: "12pt",cursor:"pointer"}}>
					{"Next"}
				</button>
			);
		}

		var leftStyle = null;
        var middleStyle = null;
        var rightStyle = null;

        
        var baseStyle = {
            "float": "left",
            minHeight: "1px",
            marginTop: "8px",
            fontFamily:"Arial"
        };

        rightStyle = _.extend({textAlign:"right", width: "34%"}, baseStyle);
        middleStyle = _.extend({textAlign:"center", width: "33%",fontSize:"11pt"}, baseStyle);
        leftStyle = _.extend({ width: "33%"}, baseStyle)
        
        var options = [];

        for(var i = 1; i<= this.props.maxPage; i++){
            options.push(<option value={i} key={i}>{i}</option>);
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
		return (
			<div style={{minHeight: "35px"}}>
				<div className={this.props.previousClassName} style={leftStyle}>
					{previous}
				</div>
				<div className={"dataTable-page"} style={middleStyle}>
					<select value={this.props.currentPage+1} onChange={this.pageChange} style={selectStyle}>
						{options}
					</select>
					{" / "}
					{this.props.maxPage}
				</div>
				<div className={this.props.nextClassName} style={rightStyle}>
					{next}
				</div>
			</div>
		);
	}
});


module.exports = TablePagination;