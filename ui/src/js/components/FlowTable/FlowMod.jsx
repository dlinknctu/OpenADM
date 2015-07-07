var React = require('react/addons');
var DataTable = require('./dataTable/DataTable.jsx');
var mui = require('material-ui');
var Toggle = mui.Toggle;
var DropDownMenu = mui.DropDownMenu;
var Ofp10_FlowMod = require('../../constants/ofp10-flow-mod.json');
var Ofp13_FlowMod = require('../../constants/ofp13-flow-mod.json');
var _ = require('underscore');
var FlowTableAction = require('../../actions/FlowTableAction.js');
var FlowModStore = require('../../stores/FlowModStore.js');

var customComponent = React.createClass({
	getInitialState: function() {
    	var state = {
    		"name": "",
    		"val": ""
    	};
        return state;
    },
    componentWillMount: function() {
    	var type = this.props.rowData.type;
    	var field = FlowModStore.getFieldVal(this.props.rowData.field);

        if(type != "action" && field !== null){
       		this.setState(field);
       	}
       	else if(type == "action"){
       		var actions = FlowModStore.getFieldVal("actions");
       		if(!actions){
       			return;
       		}
       		var actionList = actions["val"].split(",");
       		
       		for(var subaction in actionList ){
       			var action = actionList[subaction].split("=");
       			if(action[0] === this.props.rowData.field && action[0] !== "STRIP_VLAN"){
			   		this.setState({
	       				"name": action[0],
	       				"val": action[1]
	       			});
	       			break;
       			}
       			if(action[0] === this.props.rowData.field && action[0] === "STRIP_VLAN"){
       				this.setState({
	       				"name": action[0],
	       				"val": true
	       			});
	       			break;
       			}
       		}
       	}
    },
    handleActionChange:function(name, val){

    	var actions = FlowModStore.getFieldVal("actions");
    	var valLen = val.toString().trim().length;
    	var actionList;
    	
    	if(!actions)
       		actionList=[];	
       	else
       		actionList = actions["val"].split(",");

		
		for(var indx = 0;indx < actionList.length; ++indx){
			if(actionList[indx].indexOf(name) >= 0){		
					actionList.splice(indx,1);
					break;	
			}
		}

		if(name !== "STRIP_VLAN" && valLen > 0)
			actionList.push(name + "=" + val);
		else if(name == "STRIP_VLAN" && val !== false)
			actionList.push(name);
		
		var field = {
			"name": name,
			"val": val
		};
		var actions = {
			"name": "actions",
			"val": actionList.toString()
		};
		this.setState(field);
		FlowTableAction.updateFlowMod(actions);
    },
	handleChange:function(e){
		var field = {};
		if(this.props.rowData.type == "action"){
			this.handleActionChange(e.target.name, e.target.value);
		}else{
			var field = {
				"name": e.target.name,
				"val": e.target.value
			};
			this.setState(field);
			FlowTableAction.updateFlowMod(field);
		}
		
	},
	handleToggle: function(e,toggled){
		
		if(this.props.rowData.field == "STRIP_VLAN"){
		 	this.handleActionChange(e.target.name, e.target.checked);
		}else{
			var field = {
				"name": e.target.name,
				"val": e.target.checked
			};
			this.setState(field);
			FlowTableAction.updateFlowMod(field);
		}
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
			"width":"200px"
		};
	   	if(inputType == "text"){
			return <input type = "text" 
						  placeholder={placeholder? placeholder:''}
						  style={txtFieldStyle} 
						  onChange={this.handleChange}
						  name={this.props.rowData.field}
						  value={this.state.val}/>
		}
		else if(inputType == "toggle"){
			var defaultVal = (this.props.rowData.field == "active")? true : false;
			var isToggled = (this.state.val=="")? defaultVal : (this.state.val.toString()==="true");
			return <Toggle name={this.props.rowData.field} 
					   	   onToggle={this.handleToggle}
					   	   defaultToggled={isToggled}/>
		}
   }
});

var FlowMod = React.createClass({
	componentWillMount: function() {
		
        FlowTableAction.fetchFlowMod();
        var initialCommand = FlowModStore.getInitCmd();

        this.setState({
        	"initialCommand": initialCommand
        });
    	var field = {
			"name": "command",
			"val": initialCommand
		};
		FlowTableAction.updateFlowMod(field);
    },

	getFlowModData: function(){
		var flowTableData = [];
		var objectCnt = 0;
		var flowModJson;

		if(this.props.openFlowVersion === 1.0){
			flowModJson = Ofp10_FlowMod;
			
		}else if(this.props.openFlowVersion === 1.3){
			flowModJson = Ofp10_FlowMod;
		}

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
	getDefaultProps: function(){
		return{
            "openFlowVersion": 1.0,
        };
	},
	getInitialState: function(){
		var state = {
    		"initialCommand": "ADD"
    	};
        return state;
	},
	getSelectedIndex: function(menuItems){
		for(var item in menuItems){
			if(menuItems[item].text === this.state.initialCommand){
				return parseInt(item);
			}
		}
	},
	menuOnChange: function(e, selectedIndex, menuItem){
		var cmd = menuItem["text"];
		var field = {
			"name": "command",
			"val": cmd
		};
		FlowTableAction.updateFlowMod(field);
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
		var dropDownMenuIndex = this.getSelectedIndex(menuItems);

    	return (
    		<div style={{marginTop: "-60px"}}>
	    		<DropDownMenu menuItems={menuItems} 
	    				      autoWidth={false} 
	    				      style={flow_mod_cmd} 
	    				      selectedIndex={dropDownMenuIndex}
	    				      onChange={this.menuOnChange}/>
	    		
	    		<DataTable results={flowModField} columnMetadata={metadata} showFilter={true} 
	    		columns={["type", "field", "input"]}
	    		enableInfiniteScroll={true}
	    		bodyHeight={230}/>
    		</div>
    	);
    }
});

module.exports = FlowMod;