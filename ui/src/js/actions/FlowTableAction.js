var alt = require("../alt.js");
var FlowTableFetcher = require("../utils/FlowTableFetcher.js");

class FlowTableAction {
    /** fetch & update flows **/
    fetchFlowTable() {
        this.dispatch();

        FlowTableFetcher.fetchFlow()
        .then((flows) => {
            // we can access other actions within our action through `this.actions`
            this.actions.updateFlowTable(flows);
        })
        .catch((errorMessage) => {
            this.actions.flowTableFailed(errorMessage);
        });
    }

    updateFlowTable(flows) {
        this.dispatch(flows);
    }

    flowTableFailed(errorMessage) {
        this.dispatch(errorMessage);
    }

    /** fetch & update storage columns **/
    fetchStorageColumn(){
        this.dispatch();

        FlowTableFetcher.fetchStorageColumn()
        .then((columns) => {
            // we can access other actions within our action through `this.actions`
            this.actions.updateStorageColumn(columns);
        })
        .catch((errorMessage) => {
            this.actions.flowTableFailed(errorMessage);
        });
    }

    updateStorageColumn(columns){
        this.dispatch(columns);
    }

    storageColumnFailed(errorMessage) {
        this.dispatch(errorMessage);
    }

    /** fetch & update flow mod **/
    fetchFlowMod(){
        this.dispatch();
    }

    updateFlowMod(field){
        this.dispatch(field);
    }

    flowModFailed(errorMessage){
        this.dispatch(errorMessage);
    }
}

module.exports = alt.createActions(FlowTableAction);
