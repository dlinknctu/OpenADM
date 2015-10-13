var url = require('../../../config/config.json');

var Config = {
  	getFlowModUrl: function () {
    	return url.OpenADMCoreURL + "flowmod";
  	},
  	getTopFlowUrl: function(){
  		return url.OpenADMCoreURL + "flow/top";
  	},
  	getSwitchFlowUrl: function(dpid){
  		return url.OpenADMCoreURL + "flow?dpid="+dpid;
  	}
};

module.exports = Config;
