var coreIP = "pal.zespre.com";
var corePort = "5567";

var Config = {
  	getFlowModUrl: function () {
    	return "http://"+coreIP+":8080/wm/omniui/add/json";
  	},
  	getTopFlowUrl: function(){
  		return "http://"+coreIP+":"+corePort+"/flow/top";
  	},
  	getSwitchFlowUrl: function(dpid){
  		return "http://"+coreIP+":"+corePort+"/flow?dpid="+dpid;
  	}
};

module.exports = Config;
