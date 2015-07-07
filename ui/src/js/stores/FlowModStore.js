var alt = require('../alt.js');
var FlowTableAction = require('../actions/FlowTableAction.js');
var _ = require("underscore");

class FlowModStore {
	constructor() {
		this.flowMod = [];
		this.hasInitialData = false;
		this.initialCommand = "ADD";
		this.isLoading = false;
		this.errorMessage = null;

		this.bindListeners({
      		handleUpdateFlowMod: FlowTableAction.updateFlowMod,
      		handleFetchFlowMod: FlowTableAction.fetchFlowMod,
      		handleFlowModFailed: FlowTableAction.flowModFailed,
      		handleInitialFlowMod: FlowTableAction.triggerFlowMod,
    	});

    	this.exportPublicMethods({
	    	getFieldVal: this.getFieldVal,
	    	getInitCmd: this.getInitCmd
	    });
	}

	handleUpdateFlowMod(field){
		var length = this.flowMod.length;
		for(var i = 0; i < length; ++i){
			if(this.flowMod[i].name === field.name){
				this.flowMod.splice(i,1);
				break;
			}
		}

		if(field.val !== null && field.val.toString().trim().length !== 0){
			this.flowMod.push(field);
		}
	}

	handleFetchFlowMod(){
		if(!this.hasInitialData){
			this.flowMod = [];
			this.initialCommand = "ADD";
		}
	}

	handleFlowModFailed(errorMessage){
		this.errorMessage = errorMessage;
	}

	getFieldVal(name){
		var { flowMod } = this.getState();
		for (var i = 0; i < flowMod.length; i += 1) {
	      	if (flowMod[i].name === name) {
	        	return flowMod[i];
	      	}
	    }
	    return null;
	}

	getInitCmd(){
		var { initialCommand } = this.getState();
		return initialCommand;
	}

	handleInitialFlowMod(arr){	// arr is [triggerDialog, data, command]

		var data = arr[1];
		if(!data){
			this.hasInitialData = false;
			return;
		}

		this.hasInitialData = true;
		this.initialCommand = arr[2];
		this.flowMod = [];
		
		var cmd = arr[2];
		var command = new Object;
		var discardField = ["srcIPMask", "dstIPMask","duration", "counterByte", "counterPacket"];
		//set openflow field
		for(var key in data) {
            var field = new Object;
            field["name"] = key;
            field["val"] = data[key];
            if(_.indexOf(discardField, field["name"].toString()) >= 0){
				continue;
			}
            	this.flowMod.push(field);
        }

        //set command
		command["name"] = "command";
        command["val"] = cmd;
		this.flowMod.push(command);	
	}
}

module.exports = alt.createStore(FlowModStore, 'FlowModStore');