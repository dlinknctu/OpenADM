var React = require('react');
var mui = require('material-ui');
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var LinearProgress = mui.LinearProgress;
var Dialog = mui.Dialog;
var FlowMod = require("./FlowMod.jsx");
var DataTable = require('./dataTable/DataTable.jsx');
var OFP10_ColumnMetadata = require('../../constants/ofp10-metadata.json');
var FlowTableStore = require('../../stores/FlowTableStore.js');
var FlowTableAction = require('../../actions/FlowTableAction.js');
var _ = require("underscore");

var customComponent = React.createClass({
    handle_MOD_ST: function(){
        var resultData = this.props.rowData;
        for(var key in resultData){
            var value = resultData[key];
            if(value == "" || value == null)
                delete resultData[key];
        }

        FlowTableAction.triggerFlowMod(true, resultData, "MOD_ST");
    },
    handle_DEL_ST: function(){
        this.refs.delCheck.show();
    },
    closeDelCheckSection:function(){
        var resultData = this.props.rowData;
        for(var key in resultData) {
            var value = resultData[key];
            if(value == "" || value == null)
                delete resultData[key];
        }
        FlowTableAction.triggerFlowMod(false, resultData, "DEL_ST");
        var body = document.getElementsByTagName('body')[0];
        body.style.overflow = '';
    },
    execute_DEL_ST:function(){
        this.refs.delCheck.dismiss();
        FlowTableAction.submitFlowMod();
    },
    render: function(){
        var filedName = this.props.rowData.field;

        var MOD_ST_btnStyle = {
            "height": "20px",
            "width": "80px",
            "fontSize": "9pt",
            "marginBottom": "4px",
        };

        var DEL_ST_btnStyle = {
            "height": "20px",
            "width": "80px",
            "fontSize": "9pt",
        };
        var delActions = [
          { text: 'Cancel' },
          { text: 'Submit', onTouchTap: this.execute_DEL_ST }
        ];
        var warningTitle = (
            <div style={{padding:"20px 0px 0px 20px"}}>
                <img src={"http://goo.gl/K90aWa"} width="50px" height="50px"/>
                <span style={{fontSize:"20pt",fontWeight:"bold", marginLeft:"20px",position:"relative",top:"-15px"}}>Warning</span>
            </div>
        );

        return(
            <div>
                <Dialog ref="delCheck"
                    title={warningTitle}
                    actions={delActions}
                    onDismiss={this.closeDelCheckSection}
                    contentStyle={{fontFamily:"Arial", width:"600px"}} >
                    <span style={{fontSize:"14pt"}}>
                    Are you sure to remove this flow?
                    </span>
                </Dialog>
                <RaisedButton label="MOD_ST"
                              secondary={true}
                       style={MOD_ST_btnStyle}
                       labelStyle={{padding:"0",fontSize:"10pt",margin:"0",lineHeight: "20px"}}
                       onClick={this.handle_MOD_ST}/>
                <br/>
                <RaisedButton label="DEL_ST"
                      primary={true}
                      style={DEL_ST_btnStyle}
                      labelStyle={{padding:"0",fontSize:"10pt",margin:"0",lineHeight: "20px"}}
                      onClick={this.handle_DEL_ST}/>
            </div>
        );

   }
});

var FlowTable = React.createClass({
    componentDidMount: function() {
        FlowTableStore.listen(this.flowTableChange);
        //console.log("didmount", this.props.filter);
        this.setState({filter: this.props.filter},function(){
            FlowTableAction.fetchFlowTable(this.props.filter);
            FlowTableAction.fetchStorageColumn();
        });
    },

    componentWillUnmount: function() {
        FlowTableStore.unlisten(this.flowTableChange);
    },
    componentWillReceiveProps:function(nextProps){
        //console.log("receive", nextProps.filter,this.state.filter);
        if(nextProps.filter !== this.state.filter){
            this.setState({filter: nextProps.filter},function(){
                FlowTableAction.fetchFlowTable(nextProps.filter);
                FlowTableAction.fetchStorageColumn();
            });
        }
    },
    flowTableChange: function(state){
        this.setState(state, function(){
            if(this.state.triggerFlowMod){
                this.refs.flowModDialog.show();
            }
        });

        if(this.state.fetchNewData){
            FlowTableAction.fetchFlowTable(this.props.filter);
        }

    },
    getInitialState: function() {
        var state = {
            flows:[],
            storageColumn: [],
            triggerFlowMod: false,
            isLoading: false,
            fetchNewData:false,
            filter: "",
        }
        return state;
    },
    getDefaultProps: function(){
        return{
            "useFixedLayout": false,
            "openFlowVersion": 1.0,
            "showFilter": true,
            "showSettings": true,
            "showFlowMod": true,
        };
    },
    getFlowModSection: function(){
        if(this.state.triggerFlowMod){
            return (
                <FlowMod openFlowVersion={this.props.openFlowVersion}
                         flowModVals={this.onDialogSubmit} />
            );
        }
        else
            return "";
    },
    closeFlowModSection: function() {
        FlowTableAction.triggerFlowMod(false, null);
        var body = document.getElementsByTagName('body')[0];
        body.style.overflow = '';
    },
    toggleFlowModSection: function(){
        FlowTableAction.triggerFlowMod(true, null);
    },
    onFlowModSubmit: function(){
        this.refs.flowModDialog.dismiss();
        FlowTableAction.submitFlowMod();
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
                                onTouchTap={this.toggleFlowModSection} />
                </div>
            );
        }
    },
    updateStorageColumn: function(cols){
        FlowTableAction.updateStorageColumn(cols);
    },
    getLoadingSection:function(){
        return(
            <div style={{textAlign:"center"}}>
                <div style={{margin:"80px 0px 10px 15px",fontSize:"16pt"}}>
                    Fectching Data...
                </div>
                <img src="https://performance.sucuri.net/assets/loading-bar.gif"
                     width="250px"/>
            </div>
        );
    },
    render: function() {

        var flowModBtn = this.getFlowModBtn();
        var flowModSection = this.getFlowModSection();
        var standardActions = [
          { text: 'Cancel' },
          { text: 'Submit', onTouchTap: this.onFlowModSubmit, ref: 'submit' }
        ];
        var FlowTableColumnMetadata;
        if(this.props.openFlowVersion === 1.0){
            FlowTableColumnMetadata = OFP10_ColumnMetadata;
            _.extend(FlowTableColumnMetadata[0],{"customComponent": customComponent});
        }
        else if(this.props.openFlowVersion === 1.3){

        }

        if(this.state.isLoading){
            var loadingSection = this.getLoadingSection();
            return (
                <div className={"flow-table"}>
                    {loadingSection}
                </div>
            );
        }

        return(
            <div className={"flow-table"}>
                <div className={"flow-mod-section"}>
                {flowModBtn}
                <Dialog ref="flowModDialog"
                    title={"Flow Mod"}
                    actions={standardActions}
                    actionFocus="submit"
                    onDismiss={this.closeFlowModSection}
                    contentStyle={{fontFamily:"Arial"}}>
                    {flowModSection}
                </Dialog>
                </div>
                <div className={"flow-table-section"}>
                    <DataTable results={this.state.flows}
                               columns={this.state.storageColumn}
                               columnMetadata={FlowTableColumnMetadata}
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
