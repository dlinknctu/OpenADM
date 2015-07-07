var React = require('react');

var TableFilter = React.createClass({
	handleChange: function(event){
		this.props.changeFilter(event.target.value);
	},
	render: function() {
		var tableFilterStyle = {
			"height": "38px",
			"padding": "6px 10px",
			"backgroundColor": "#fff",
			"border": "1px solid #D1D1D1",
			"borderRadius": "4px",
			"boxShadow": "none",
			"boxSizing": "border-box",
			"textRendering": "auto",
			"WebkitWritingMode": "horizontal-tb",
			"marginBottom": "1em",
			"fontSize": "11pt",
			"width":"180px"
		};
		return (
			<div>
				<input type={"text"} 
					   placeholder={"Filter Results"} 
					   name={"filter"} 
					   onChange={this.handleChange}
					   style={tableFilterStyle}/>
			</div>
		);
	}
});

module.exports = TableFilter;