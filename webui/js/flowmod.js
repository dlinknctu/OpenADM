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
                    }
                });
                if(!jQuery.isEmptyObject(flow)) {
                    flow["command"] = "ADD";
                    if("actions" in flow) {
                        flow["actions"] = flow["actions"].replace(/(.*)=/, function(a) {
                            return a.toUpperCase();
                        });
                    }
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
                        });
                    }
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
    var flow = flows[i];
    flow["switch"] = node.id;
    var actions = flow.actions;
    var actionsStrArr = [];
    for(var j in actions) {
        actionsStrArr.push(actions[j].type + "=" + actions[j].value);
    }
    flow["actions"] = actionsStrArr.toString();
    flow["command"] = "MOD_ST";
    $("#_actions").val(flow["actions"]);

    for(var k in flow) {
        flow[k] = flow[k].toString();
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
    for(var k in flow) {
        flow[k] = flow[k].toString();
    }

    sendFlow(flow);
}