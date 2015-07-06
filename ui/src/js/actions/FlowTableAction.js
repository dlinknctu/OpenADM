var alt = require("../alt.js");
var Config = require("../utils/Config.js");
var db = window.localStorage;
require("whatwg-fetch");

// app 第一次啟動時，存入一包 mock data 到 localStorage 供測試
if( db.hasOwnProperty('flowTable_db') == false ){
    // console.log( '\n無歷史資料，存入 mock data' );
    db.setItem('flowTable_db', JSON.stringify({columns: 
      ["flowMod","switch","ingressPort","srcMac","dstMac","dlType","netProtocol","actions", "priority", "idleTimeout", "hardTimeout"]}));
}

// 接著一律從 db 讀取歷史資料
var o = JSON.parse(db.getItem('flowTable_db'));
var StorageColumn = o.columns ? o.columns : [];
//=======================================================//

class FlowTableAction {
    constructor() {
        this.generateActions('triggerFlowMod');  // "triggerFlowMod" pass multiple value
    }
    /** fetch & update flows **/
    fetchFlowTable(filter) { 
        this.dispatch(filter);
        var url;
        if(filter == "none"){
            url = Config.getTopFlowUrl();
        }else{
            url = Config.getSwitchFlowUrl(filter);

        }
        
        fetch(url)
            .then((res) => res.json())
            .then((json) => {
               this.actions.updateFlowTable(json);
            })
            .catch((e) => console.log("Something bad happens!!", e));
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
        this.actions.updateStorageColumn(StorageColumn);
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

    initialFlowMod(data){
        this.dispatch(data);
    }

    submitFlowMod(){
        var url = Config.getFlowModUrl();
        this.dispatch(url);
    }
}

module.exports = alt.createActions(FlowTableAction);
