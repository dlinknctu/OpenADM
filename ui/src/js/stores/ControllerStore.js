var alt = require("../alt.js");
var ControllerAction = require("../actions/ControllerAction.js");

class ControllerStore {
    constructor(){
        this.controllerLists = [
            { domainName: "工程三館", ip: "140.113.215.216" },
            { domainName: "工程四館", ip: "140.113.102.133" }
        ];

        this.bindListeners({
          handleGetControllerList: ControllerAction.getControllerList
        });
    }

    handleGetControllerList(controllerLists){
        console.log("這不會跑吧", controllerLists);
        this.controllerLists = controllerLists;
    }
}

module.exports = alt.createStore(ControllerStore, "ControllerStore");
