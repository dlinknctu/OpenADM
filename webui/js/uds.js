toastr.options = {
    'closeButton': true,
    'debug': false,
    'positionClass': 'toast-bottom-right',
    'onclick': null,
    'showDuration': '300',
    'hideDuration': '1000',
    'timeOut': '5000',
    'extendedTimeOut': '1000',
    'showEasing': 'swing',
    'hideEasing': 'linear',
    'showMethod': 'fadeIn',
    'hideMethod': 'fadeOut'
}

function notifyUser(type, content, title) {
    toastr[type](content, title);
}

function updateShowcase(json) {
    var nodes = json.nodes;
    console.log(nodes);
    $('#showcase').empty();
    for(var i in nodes) {
        var node = nodes[i];
        var flows = node.flows;
        for(var j in flows) {
            var flow = flows[j];
            var flowRow = $('<div>', {class: 'row'});
            $('<div>', {class: 'col-md-2'}).append($('<span>').html(node.dpid)).appendTo(flowRow);
            $('<div>', {class: 'col-md-2'})
                .append($('<span>').html(flow['duration'] + '/' + flow['packet_count'] + '/' + flow['byte_count']))
                .appendTo(flowRow);
            delete flow['duration'];
            delete flow['packet_count'];
            delete flow['byte_count'];
            for(var k in flow) {
                var entry = $('<span>').html(k + ': ' + flow[k]);
                $('<div>', {class: 'col-md-2'}).append(entry).appendTo(flowRow);
            }
            $('#showcase').append(flowRow);
        }
    }
}

function udsEntryMgmt(action, oxm_match) {
    $.ajax({
        type: 'PUT',
        url: getUdsUrl() + '/' + action,
        data: JSON.stringify(oxm_match),
        success: function(resp) {
            notifyUser('success', 'Flow added successfully.', action.toUpperCase() + ' FLOW');
            $('input').val('');
            console.log(resp);
        },
        error: function(resp) {
            notifyUser('error', 'Something went wrong.', action.toUpperCase() + ' FLOW');
            console.log(resp);
        }
    });
}

function parseInput() {
    var oxm_match = new Object();
    $('#oxm-form').find('input').each(function() {
        if($(this).val() != '') {
            if($(this).attr('id') != 'dpid') {
                oxm_match[$(this).attr('id')] = $(this).val();
            }
        }
    });
    var data = new Object;
    if(!$.isEmptyObject(oxm_match)) {
        data['match'] = oxm_match;
    }
    if($('#dpid input').val() != '') {
        data['dpid'] = $('#dpid input').val();
    }
    if(!('dpid' in data) && $.isEmptyObject(data['match'])) {
        throw 'You didn\'t fill anything!';
    }
    console.log(data);
    return data;
}

function serverSentEvent() {
    var evtSrc = new EventSource(getSubscribeUrl());
    evtSrc.addEventListener('updateuds', function(e) {
        updateShowcase(JSON.parse(e.data));
    }, false);
}

$(document).ready(function() {
    $('#add-flow').click(function() {
        try {
            udsEntryMgmt('add', parseInput());
        } catch(err) {
            notifyUser('warning', err, 'ADD FLOW');
        }
    });
    $('#del-flow').click(function() {
        try {
            udsEntryMgmt('del', parseInput());
        } catch(err) {
            notifyUser('warning', err, 'DEL FLOW');
        }
    });
    $('.panel-title').click(function() {
        var d = $(this).closest('.panel-heading').next();
        var s = $(this).find('.glyphicon');
        $(this).closest('.panel-group').find('.glyphicon')
            .removeClass('glyphicon-chevron-down')
            .addClass('glyphicon-chevron-up');
        if(d.attr('class').split(' ').indexOf('in') == -1) {
            s.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        }
    });

    serverSentEvent();
});
