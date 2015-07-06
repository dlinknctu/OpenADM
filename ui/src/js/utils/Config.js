var url = require('../../../config/config.json');

var Config = {
  	getFlowModUrl: function () {
    	return url.OmniUICoreURL + "flowmod";
  	},
  	getTopFlowUrl: function(){
  		return url.OmniUICoreURL + "flow/top";
  	},
  	getSwitchFlowUrl: function(dpid){
  		return url.OmniUICoreURL + "flow?dpid="+dpid;
  	}
};

module.exports = Config;
