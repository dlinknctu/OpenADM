var alt = require('../alt.js');
var TopologyAction = require('../actions/TopologyAction.js');

class TopologyStore {
    constructor() {
        this.isSubscribe = false;
        this.errorMessage = null;
        this.topology = {};
        this.focusNode = null;

        this.bindListeners({
            handleAddLink: TopologyAction.addLink,
            handleDelLink: TopologyAction.delLink,
            handleAddDevice: TopologyAction.addDevice,
            handleDelDevice: TopologyAction.delDevice
        });

    }

    handleAddLink(link) {
        console.log("handleAddLink ", link);
    }

    handleDelLink(link) {
        console.log("handleAddLink ", link);
    }

    handleAddDevice(dpid) {
        console.log("handleAddDevice ", dpid)
    }

    handleDelDevice(dpid) {
        console.log("handleDelDevice ", dpid)
    }
}

module.exports = alt.createStore(TopologyStore, 'TopologyStore');
