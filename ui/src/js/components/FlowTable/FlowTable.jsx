var React = require('react');
var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();
var FlatButton = mui.FlatButton;
var Dialog = mui.Dialog;
var FlowMod = require("./FlowMod.jsx");
var DataTable = require('./dataTable/DataTable.jsx');
var FlowTableColumOrder = require('../../constants/flow-table-order.json');
var FlowTableStore = require('../../stores/FlowTableStore.js');
var FlowTableAction = require('../../actions/FlowTableAction.js');


var FlowTable = React.createClass({
    /**
     * 這是 component API, 在 mount 前會跑一次，取值做為 this.state 的預設值
     */
     // Important!
    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    // Important!
    getChildContext: function() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    },
    componentDidMount: function() {
        FlowTableStore.listen(this.flowTableChange);
        FlowTableAction.fetchFlowTable();
        FlowTableAction.fetchStorageColumn();
    },
    componentWillUnmount: function() {
        FlowTableStore.unlisten(this.flowTableChange);
    },
    flowTableChange: function(state){
        this.setState(state);
    },
    getInitialState: function() {
    	var state = {
    		flows:[],
            storageColumn: [],
    		showFlowModSection: false
    	}
        return state;
    },
    getDefaultProps: function(){
		return{
            "useFixedLayout": false,
            "openFlowVersion": 1.3,
            "showFilter": true,
            "showSettings": true,
            "showFlowMod": true
        };
	},
    getFlowModSection: function(){
    	if(this.state.showFlowModSection){
	    	return (
	            <FlowMod flowModVals={this.onDialogSubmit} />
	    	);
    	}
    	else
    		return "";
    },
    closeFlowModSection:function(){
    	this.setState({
            showFlowModSection: false
        });
    },
    toggleFlowModSection: function(){
        this.setState({
            showFlowModSection: true
        });
        this.refs.flowModDialog.show();
    },
    getFlowModBtn: function(){
    	if(this.props.showFlowMod){
    		var addFlowStyles = {
	            "float": "right",
	            textAlign: "right",
	            marginRight: "140px",
	            marginBottom: "-50px"

        	};
        	return (
        		<div style={addFlowStyles}>
					<FlatButton label={"FLOW MOD"}
                                style={{"fontWeight":"bold",fontFamily: "Arial"}}
                                onTouchTap={this.toggleFlowModSection}
                                />
				</div>
        	);
    	}
    },
    updateStorageColumn: function(cols){
        FlowTableAction.updateStorageColumn(cols);
    },
    onDialogSubmit: function(flowModArray){

    },
	render: function() {

        ThemeManager.setTheme(ThemeManager.types.LIGHT);

		var flowModBtn = this.getFlowModBtn();
		var flowModSection = this.getFlowModSection();
		var standardActions = [
		  { text: 'Cancel' },
		  { text: 'Submit', onTouchTap: this.onDialogSubmit }
		];

		return(
			<div>
				{flowModBtn}
				<Dialog ref="flowModDialog"
                    title={"Flow Mod"}
                    actions={standardActions}
                    onDismiss={this.closeFlowModSection}
                    contentStyle={{fontFamily:"Arial"}}>
					{flowModSection}
				</Dialog>
				<div className={"flow-table-section"}>
		    		<DataTable results={this.state.flows}
	               			   columns={this.state.storageColumn}
	               			   columnMetadata={FlowTableColumOrder}
	               			   useFixedLayout={this.props.useFixedLayout}
	               			   showFilter={this.props.showFilter}
	               			   showSettings={this.props.showSettings}
	               			   openFlowVersion={this.props.openFlowVersion}
	               			   refreshLocalStorage={this.updateStorageColumn}
	                 />
		    	</div>
    		</div>
		);
	}
});

module.exports = FlowTable;
