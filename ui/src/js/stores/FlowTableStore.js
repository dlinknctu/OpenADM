var alt = require('../alt.js');
var FlowTableAction = require('../actions/FlowTableAction.js');
var db = window.localStorage;

class FlowTableStore {
	constructor() {
		this.flows = [];
		this.storageColumn = [];

		this.errorMessage = null;

		this.bindListeners({
      		handleUpdateFlowTable: FlowTableAction.updateFlowTable,
      		handleFetchFlowTable: FlowTableAction.fetchFlowTable,
      		handleFlowTableFailed: FlowTableAction.flowTableFailed,

      		handleUpdateStorageColumn: FlowTableAction.updateStorageColumn,
      		handleFetchStorageColumn: FlowTableAction.fetchStorageColumn,
      		handleStorageColumnFailed: FlowTableAction.storageColumnFailed,
    	});
	}

	handleUpdateFlowTable(flows){
		this.flows = flows;
    	this.errorMessage = null;
	}

	handleFetchFlowTable(){
		this.flows = [];
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
}

module.exports = alt.createStore(FlowTableStore, 'FlowTableStore');