var alt = require('../alt.js');
var FlowTableAction = require('../actions/FlowTableAction.js');
var FlowModStore = require('../stores/FlowModStore.js');
var _ = require("underscore");
var db = window.localStorage;

class FlowTableStore {
	constructor() {
		this.flows = [];
		this.filter = "";
		this.storageColumn = [];
		this.triggerFlowMod = false;
		this.errorMessage = null;
		this.isLoading = false;
		this.fetchNewData = false;
		this.bindListeners({
      		handleUpdateFlowTable: FlowTableAction.updateFlowTable,
      		handleFetchFlowTable: FlowTableAction.fetchFlowTable,
      		handleTriggerFlowMod: FlowTableAction.triggerFlowMod,
      		handleFlowTableFailed: FlowTableAction.flowTableFailed,

      		handleUpdateStorageColumn: FlowTableAction.updateStorageColumn,
      		handleFetchStorageColumn: FlowTableAction.fetchStorageColumn,
      		handleStorageColumnFailed: FlowTableAction.storageColumnFailed,

      		handleSubmitFlowMod: FlowTableAction.submitFlowMod
    	});
	}

	parseActions(dpid, flow, actionList){

		//set switch dpid
		var object = new Object;
		object["switch"] = dpid;
		//set switch flows
		if(actionList != null){	//parse actions to string
			if(actionList.length == 0){
				flow= ""
			}else{
				var actions = [];
				for(var action in actionList){
					var actionStr = "";
					if(actionList[action].type && actionList[action].value){
						actionStr = actionList[action].type + "=" +actionList[action].value;
						actions.push(actionStr);
					}else if(actionList[action].type && !actionList[action].value){
						actionStr = actionList[action].type;
						actions.push(actionStr);
					}

				}
				flow["actions"] = actions.toString();

			}
		}
		_.extend(object, flow);
		return object;
	}

	handleUpdateFlowTable(sw){
		var resultData = [];
		if(this.filter === "none"){
			for(var i in sw){
				var flows = sw[i].flows;

				for(var j in flows){
					var dpid = sw[i].dpid;
					var actionList = flows[j].actions;
					var object = this.parseActions(dpid, flows[j], actionList);
					resultData.push(object);
				}
			}
		} else {	// only one switch's flow
			var flows = sw.flows;

			for(var j in flows){
				var dpid = sw.dpid;
				var actionList = flows[j].actions;
				var object = this.parseActions(dpid, flows[j], actionList);
				resultData.push(object);
			}
		}
		this.flows = resultData;
    	this.errorMessage = null;
	}

	handleTriggerFlowMod(arr){	// arr is [triggerDialog, data, command]
		var trigger = arr[0];
		this.triggerFlowMod = trigger;
	}

	handleFetchFlowTable(filter){
		this.fetchNewData = false;
		this.flows = [];
		this.filter = filter;
	}

	handleFlowTableFailed(errorMessage){
		this.errorMessage = errorMessage;
	}

	handleUpdateStorageColumn(cols){
		this.storageColumn = cols;
		this.errorMessage = null;
		db.setItem('flowTable_db', JSON.stringify({columns: cols}));
	}

	handleFetchStorageColumn(){
		this.storageColumn = [];
	}

	handleStorageColumnFailed(errorMessage){
		this.errorMessage = errorMessage;
	}

	handleSubmitFlowMod(url){
		var data = {};
		var {flowMod} = FlowModStore.getState();
		for(var key in flowMod){
			var field = new Object;
			field[flowMod[key].name.toString()] = flowMod[key].val;
			_.extend(data,field)

		}
		var postJson = JSON.stringify(data);

		fetch(url, {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: postJson
        })
        .then((data) => {
            console.log('request succeeded with JSON response', data.status);
            this.fetchNewData = true;
            this.emitChange();
        }).catch((error) => {
            console.log('request failed', error)
        })
	}
}

module.exports = alt.createStore(FlowTableStore, 'FlowTableStore');
