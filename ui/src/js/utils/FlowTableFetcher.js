var FlowTableAction = require('../actions/FlowTableAction.js');
var FlowMockData = require('../constants/flow-table.json');
var db = window.localStorage;

// app 第一次啟動時，存入一包 mock data 到 localStorage 供測試
if( db.hasOwnProperty('flowTable_db') == false ){
    // console.log( '\n無歷史資料，存入 mock data' );
    db.setItem('flowTable_db', JSON.stringify({columns: ["dpid","in_port","dl_src","dl_dst","dl_type","actions","idle_timeout"]}));
}

// 接著一律從 db 讀取歷史資料
var o = JSON.parse(db.getItem('flowTable_db'));
var StorageColumn = o.columns ? o.columns : [];
//=======================================================//

var FlowTableFetcher = {
    fetchFlow: function () {
        // returning a Promise because that is what fetch does.
        return new Promise(function (resolve, reject) {
            // simulate an asynchronous action where data is fetched on
            // a remote server somewhere.
            setTimeout(function () {
                // resolve with some mock data
                resolve(FlowMockData);
            }, 0);
        });
    },
    fetchStorageColumn: function(){
        return new Promise(function (resolve, reject) {
            resolve(StorageColumn);
        });
    }
};

module.exports = FlowTableFetcher;
