var alt = require("../alt.js");
require("whatwg-fetch");

class TopologyAction {
    subscribe(cid) {
        this.dispatch(cid);
    }

    addLink(link) {
        this.dispatch(link);
    }

    delLink() {
        this.dispatch(link);
    }

    addDevice(dpid) {
        this.dispatch(dpid);
    }

    delDevice(dpid) {
        this.dispatch(dpid);
    }
}

module.exports = alt.createActions(TopologyAction);
