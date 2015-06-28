var defaultFlow = {
    "switch": "00:00:00:00:00:00:00:01",
    "ingressPort": "0",
    "vlan": "0",
    "vlanP": "0",
    "srcMac": "00:00:00:00:00:00",
    "dstMac": "00:00:00:00:00:00",
    "dlType": "0",
    "dstIP": "0.0.0.0/0",
    "srcIP": "0.0.0.0/0",
    "tosBits": "0",
    "netProtocol": "0",
    "srcPort": "0",
    "dstPort": "0",
    "actions": "",
    "priority": "32767",
    "active": "true",
    "hardTimeout": "0",
    "idleTimeout": "0"
};

$(function() {
    $("#send-dialog").dialog({
        autoOpen: false,
        height: 600,
        width: 350,
        modal: true,
        buttons: {
            "Add": function() {
                var flow = {};
                var $label = $("#send-dialog fieldset label");
                var $input = $("#send-dialog fieldset input");
                $label.each(function(i, l) {
                    if($input.eq(i).val() != "") {
                        flow[$(this).text()] = $input.eq(i).val();
                    } else {
                        //flow[$(this).text()] = defaultFlow[$(this).text()];
                    }
                });
                if(!jQuery.isEmptyObject(flow)) {
                    flow["command"] = "ADD";
                    if("actions" in flow) {
                        flow["actions"] = flow["actions"].replace(/(.*)=/, function(a) {
                            return a.toUpperCase();
                        }).replace(/(strip_vlan)/, function(a) {
                            return a.toUpperCase();
                        });
                    }
                    if("srcIP" in flow){
                        var srcCIDR = flow["srcIP"].split(/\//);
                        flow["srcIPMask"] = (srcCIDR.length == 2)? srcCIDR[1]: "32";
                    }
                    if("dstIP" in flow){
                        var dstCIDR = flow["dstIP"].split(/\//);
                        flow["dstIPMask"] = (dstCIDR.length == 2)? dstCIDR[1]: "32";
                    }
                    if(!("actions" in flow)) flow["actions"] = "";
                    sendFlow(flow);
                }
                $(this).dialog("close");
            },
            "Modify": function() {
                var flow = {};
                var $label = $("#send-dialog fieldset label");
                var $input = $("#send-dialog fieldset input");
                $label.each(function(i, l) {
                    if($input.eq(i).val() != "") {
                        flow[$(this).text()] = $input.eq(i).val();
                    }
                });
                if(!jQuery.isEmptyObject(flow)) {
                    flow["command"] = "MOD";
                    if("actions" in flow) {
                        flow["actions"] = flow["actions"].replace(/(.*)=/, function(a) {
                            return a.toUpperCase();
                        }).replace(/(strip_vlan)/, function(a) {
                            return a.toUpperCase();
                        });
                    }else flow["actions"] = "";
                    sendFlow(flow);
                }
                $(this).dialog("close");
            },
            "Delete": function() {
                var flow = {};
                var $label = $("#send-dialog fieldset label");
                var $input = $("#send-dialog fieldset input");
                $label.each(function(i, l) {
                    if($input.eq(i).val() != "") {
                        flow[$(this).text()] = $input.eq(i).val();
                    }
                });
                if(!jQuery.isEmptyObject(flow)) {
                    flow["command"] = "DEL";
                    if(!("actions" in flow)) flow["actions"] = "";
                    sendFlow(flow);
                }
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            $("#send-dialog fieldset input").each(function() {
                $(this).val("");
            });
        }
    });
    $("#actions-dialog").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Modify": function() {
                var flow = $(this).data("flow");
                flow["actions"] = $("#_actions").val();
                if("actions" in flow) {
                    flow["actions"] = flow["actions"].replace(/(.*)=/, function(a) {
                        return a.toUpperCase();
                    }).replace(/(strip_vlan)/, function(a) {
                        return a.toUpperCase();
                    });
                }
                sendFlow(flow);
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            $("#actions-dialog fieldset input").each(function() {
                $(this).val("");
            });
        }
    });
    $("#send").click(function() {
        $("#send-dialog").dialog("open");
        $('.ui-widget-overlay').css('background', 'gray');
    });
});

function modFlow(i) {
    var flow = JSON.parse(JSON.stringify(flows[i]));
    flow["switch"] = node.id;
    var actions = flow.actions;
    var actionsStrArr = [];
    for(var j in actions) {
        if("value" in actions[j]) {
            actionsStrArr.push(actions[j].type + "=" + actions[j].value);
        } else {
            actionsStrArr.push(actions[j].type);
        }
    }
    flow["actions"] = actionsStrArr.toString();
    flow["command"] = "MOD_ST";
    $("#_actions").val(flow["actions"]);
    flow["srcIP"] += ("/" + flow["srcIPMask"]);
    flow["dstIP"] += ("/" + flow["dstIPMask"]);

    for(var k in flow) {
        if(flow[k]!=null){ 
            flow[k] = flow[k].toString();
            var checkNone = flow[k].split(/\//);
            if(checkNone[0]=="None") delete flow[k];
            if(flow[k]=="0") delete flow[k];
        }else delete flow[k];
    }

    $("#actions-dialog").data("flow", flow).dialog("open");
    $('.ui-widget-overlay').css('background', 'gray');
}

function delFlow(i) {
    var flow = flows[i];
    if(flow["actions"][0]) {
        flow["actions"] = flow["actions"][0].type + "=" + flow["actions"][0].value;
    }
    flow["command"] = "DEL_ST";
    flow["switch"] = node.id;
    flow["srcIP"] += ("/" + flow["srcIPMask"]);
    flow["dstIP"] += ("/" + flow["dstIPMask"]);

    for(var k in flow) {
        if(flow[k]!=null){ 
            flow[k] = flow[k].toString();
            var checkNone = flow[k].split(/\//);
            if(checkNone[0]=="None") delete flow[k];
            if(flow[k]=="0") delete flow[k];
        }else delete flow[k];
    }

    sendFlow(flow);
}
