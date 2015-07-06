var React = require('react/addons');
var DataTable = require('./dataTable/DataTable.jsx');
var mui = require('material-ui');
var Toggle = mui.Toggle;
var DropDownMenu = mui.DropDownMenu;
var flowModJson = require('../../constants/flow-mod.json');
var _ = require('underscore');
var FlowTableAction = require('../../actions/FlowTableAction.js');
var FlowModStore = require('../../stores/FlowModStore.js');

var customComponent = React.createClass({
	getInitialState: function() {
    	var state = {
    		"name": null,
    		"val": null
    	};
        return state;
    },
    componentDidMount: function() {
        var field = FlowModStore.getFieldVal(this.props.rowData.field);
        if(field !== null){
       		this.setState(field);
       	}
    },
	handleChange:function(e){
		var field = {
			"name": e.target.name,
			"val": e.target.value
		};
		this.setState(field);
		FlowTableAction.updateFlowMod(field);
	},
	handleToggle: function(e){
		var field = {
			"name": e.target.name,
			"val": e.target.checked
		};
		FlowTableAction.updateFlowMod(field);
	},
  	render: function(){
	  	var inputType = this.props.data;
	  	var placeholder = this.props.rowData.placeholder;
	  	var filedName = this.props.rowData.field;
	  	var txtFieldStyle = {
			"height": "34px",
			"padding": "6px 10px",
			"backgroundColor": "#fff",
			"border": "1px solid #D1D1D1",
			"borderRadius": "4px",
			"boxShadow": "none",
			"boxSizing": "border-box",
			"textRendering": "auto",
			"WebkitWritingMode": "horizontal-tb",
			"fontSize": "11pt",
			"width":"180px"
		};
	   	if(inputType == "text"){
			return <input type = "text"
						  placeholder={placeholder? placeholder:''}
						  style={txtFieldStyle}
						  onChange={this.handleChange}
						  name={this.props.rowData.field}
						  value={this.state.val}/>
		}
		else if(inputType == "toggle")
			return <Toggle name={this.props.rowData.field}
						   onToggle={this.handleToggle}/>
   }
});

var FlowMod = React.createClass({
	componentWillMount: function() {
        FlowTableAction.fetchFlowMod();
    },
	getFlowModData: function(){
		var flowTableData = [];
		var objectCnt = 0;
		_.each(flowModJson, function(value, key){
			var tempArr = [];

    		if(key == "misc")
    			tempArr = flowModJson.misc;
    		else if(key == "match")
    			tempArr = flowModJson.match;
    		else if(key == "action")
    			tempArr = flowModJson.action;

    		if(tempArr.length > 0) {
	    		for (var index = 0; index < tempArr.length; ++index) {
				    var object = {};
	    			object["id"] = objectCnt++;
	    			object["type"] = key;
	    			object["field"] = tempArr[index].fieldName;
	    			object["input"] = tempArr[index].inputType;
	    			if(tempArr[index].placeholder)
	    				object["placeholder"] = tempArr[index].placeholder;
					flowTableData.push(object);
				}
			}
		}.bind(this));


		return flowTableData;
	},
    render: function() {
    	var flowModField = this.getFlowModData();

    	var metadata = [
    		{
			  	"columnName": "type",
			  	"order": 1,
			  	"visible": true,
			},
			{
			  	"columnName": "field",
			  	"order": 2,
			  	"visible": true,
			},
			{
			  	"columnName": "input",
			  	"order": 3,
			  	"visible": true,
			 	"customComponent": customComponent
			}
    	];
    	var menuItems = [
		   { payload: '1', text: 'ADD' },
		   { payload: '2', text: 'MOD' },
		   { payload: '3', text: 'MOD_ST' },
		   { payload: '4', text: 'DEL' },
		   { payload: '5', text: 'DEL_ST' }
		];

		var flow_mod_cmd = {
			"position":"relative",
			"top":"45px",
			"float":"right",
			"width":"150px"
		};

    	return (
    		<div style={{marginTop: "-60px"}}>

	    		<DropDownMenu menuItems={menuItems} autoWidth={false} style={flow_mod_cmd}/>

	    		<DataTable results={flowModField} columnMetadata={metadata} showFilter={true}
	    		columns={["type", "field", "input"]}
	    		enableInfiniteScroll={true}
	    		bodyHeight={230}/>
    		</div>
    	);
    }
});



module.exports = FlowMod;
