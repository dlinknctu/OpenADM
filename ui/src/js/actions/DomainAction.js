var alt = require("../alt.js");

require("whatwg-fetch");

class DomainAction {
    subscribeEvent(){
        var url = "http://www.filltext.com/?rows=5&domainName={firstName}&ip={ip}";
        fetch(url)
            .then((res) => res.json())
            .then((json) => {
                this.dispatch(json);
            })
            .catch((e) => console.log("Catch Error!!", e));
    }
}

module.exports = alt.createActions(DomainAction);
