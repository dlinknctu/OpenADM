var alt = require('../alt.js');
var FlowTableAction = require('../actions/FlowTableAction.js');

class FlowModStore {
	constructor() {
		this.flowMod = [];
		this.errorMessage = null;

		this.bindListeners({
      		handleUpdateFlowMod: FlowTableAction.updateFlowMod,
      		handleFetchFlowMod: FlowTableAction.fetchFlowMod,
      		handleFlowModFailed: FlowTableAction.flowModFailed,
    	});

    	this.exportPublicMethods({
	      getFieldVal: this.getFieldVal
	    });
	}

	handleUpdateFlowMod(field){
		var length = this.flowMod.length;
		for(var i = 0; i < length; ++i){
			if(this.flowMod[i].name === field.name){
				this.flowMod.splice(i,1);
			}
		}
		if(field.val !== null && field.val.toString().trim().length !== 0){
			this.flowMod.push(field);
		}
	}

	handleFetchFlowMod(){
		this.flowMod = [];
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
}

module.exports = alt.createStore(FlowModStore, 'FlowModStore');
