(function($) {
    $.fn.multiFilter = function(filters) {
        var $table = $(this);
        return $table.find('tbody > tr').each(function() {
            var tr = $(this);

            // Make it an array to avoid special cases later.
            if(!$.isArray(filters))
                filters = [ filters ];

            howMany = 0;
            for(i = 0, f = filters[0]; i < filters.length; f = filters[++i]) {
                var index = 0;
                $table.find('thead > tr > th').each(function(i) {
                    if($(this).text() == f.column) {
                        index = i;
                        return false;
                    }
                });
                var text = tr.find('td:eq(' + index + ')').text();
                if(text.indexOf(f.word) != -1)
                    ++howMany;
            }
            if(howMany == filters.length)
                tr.show();
            else
                tr.hide();
        });
    };
})(jQuery);

$('#wildcards').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: this.value },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#dstIP').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: this.value },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#srcMac').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'srcMac',  word: this.value        },
        { column: 'counterByte', word: $('#counterByte').val() }
    ]);
});
$('#counterByte').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'srcMac',  word: $('#srcMac').val() },
        { column: 'counterByte', word: this.value       }
    ]);
});
$('#srcPort').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: this.value },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#ingreePort').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: this.value },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#dstMac').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: this.value },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#actions').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: this.value },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#srcIPMask').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: this.value },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#vlan').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: this.value },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#dstIPMask').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: this.value },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#srcIP').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: this.value },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#counterPacket').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: this.value },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#dstPort').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: this.value },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#hardTimeout').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: this.value },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#idleTimeout').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: this.value },
        { column: 'netProtocol', word: $('#netProtocol').val() }
    ]);
});
$('#netProtocol').keyup(function() {
    var t = $('table');
    $('#flowtable').multiFilter([
        { column: 'wildcards', word: $('#wildcards').val() },
        { column: 'dstIP', word: $('#dstIP').val() },
        { column: 'srcMac', word: $('#srcMac').val() },
        { column: 'counterByte', word: $('#srcPort').val() },
        { column: 'srcPort', word: $('#srcPort').val() },
        { column: 'ingreePort', word: $('#ingreePort').val() },
        { column: 'dstMac', word: $('#dstMac').val() },
        { column: 'actions', word: $('#actions').val() },
        { column: 'srcIPMask', word: $('#srcIPMask').val() },
        { column: 'vlan', word: $('#vlan').val() },
        { column: 'dstIPMask', word: $('#dstIPMask').val() },
        { column: 'srcIP', word: $('#srcIP').val() },
        { column: 'counterPacket', word: $('#counterPacket').val() },
        { column: 'dstPort', word: $('#dstPort').val() },
        { column: 'hardTimeout', word: $('#hardTimeout').val() },
        { column: 'idleTimeout', word: $('#idleTimeout').val() },
        { column: 'netProtocol', word: this.value }
    ]);
});
