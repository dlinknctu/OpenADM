var alt = require("../alt.js");
require("whatwg-fetch");

class ControllerAction {
    getControllerState(cid) {
        this.dispatch(cid);
    }
    getControllerList(){
        var url = "http://www.filltext.com/?rows=5&domainName={firstName}&ip={ip}";
        fetch(url)
            .then((res) => res.json())
            .then((json) => {
                this.dispatch(json);
            })
            .catch((e) => console.log("Something bad happens!!", e));

        this.dispatch();

    }
}

module.exports = alt.createActions(ControllerAction);
