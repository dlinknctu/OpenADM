var coreIP = "http://localhost";
var corePort = "5567";

function getFeatureUrl(){
    return coreIP+":"+corePort+"/feature";
}
function getStatUrl(){
    return coreIP+":"+corePort+"/stat";
}
function getTopologyUrl(){
    return coreIP+":"+corePort+"/info/topology";
}
function getFlowModUrl(){
    return coreIP+":"+corePort+"/flowmod";
}
