var coreIP = "localhost";
var corePort = "5567";

function getFeatureUrl(){
    return "http://"+coreIP+":"+corePort+"/feature";
}
function getStatUrl(){
    return "http://"+coreIP+":"+corePort+"/stat";
}
function getTopologyUrl(){
    return "http://"+coreIP+":"+corePort+"/info/topology";
}
function getFlowModUrl(){
    return "http://"+coreIP+":"+corePort+"/flowmod";
}
function getUdsUrl(){
    return "http://"+coreIP+":"+corePort+"/uds";
}
function getSubscribeUrl(){
    return "http://"+coreIP+":"+corePort+"/subscribe";
}
