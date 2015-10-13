var alt = require('../alt.js');
var DomainAction = require('../actions/DomainAction.js');

class DomainStore {
    constructor() {
        this.isSubscribe = false;
        this.domainID = '1';
        this.errorMessage = null;

        this.bindListeners({
            handleSubscribe: DomainAction.subscribeEvent,
        });
    }

    handleSubscribe(e){

    }
}

module.exports = alt.createStore(DomainStore, 'DomainStore');
