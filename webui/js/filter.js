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
                if(!f.word) {
                    ++howMany;
                    continue;
                }
                var index = 0;
                $table.find('thead > tr > th').each(function(i) {
                    if($(this).text() == f.column) {
                        index = i;
                        return false;
                    }
                });
                var text = tr.find('td:eq(' + index + ')').text();
                if(text.toLowerCase().indexOf(f.word.toLowerCase()) != -1)
                    ++howMany;
            }
            if(howMany == filters.length)
                tr.show();
            else
                tr.hide();
        });
    };
})(jQuery);


var filtering = function($selc) {
    //var t = $('table');

    var index = 0;
    var filter = [ { column: 'wildcards',       word: $('#wildcards').val()     },
                   { column: 'dstIP',           word: $('#dstIP').val()         },
                   { column: 'srcMac',          word: $('#srcMac').val()        },
                   { column: 'counterByte',     word: $('#counterByte').val()   },
                   { column: 'srcPort',         word: $('#srcPort').val()       },
                   { column: 'ingreePort',      word: $('#ingreePort').val()    },
                   { column: 'dstMac',          word: $('#dstMac').val()        },
                   { column: 'actions',         word: $('#actions').val()       },
                   { column: 'srcIPMask',       word: $('#srcIPMask').val()     },
                   { column: 'vlan',            word: $('#vlan').val()          },
                   { column: 'dstIPMask',       word: $('#dstIPMask').val()     },
                   { column: 'srcIP',           word: $('#srcIP').val()         },
                   { column: 'counterPacket',   word: $('#counterPacket').val() },
                   { column: 'dstPort',         word: $('#dstPort').val()       },
                   { column: 'hardTimeout',     word: $('#hardTimeout').val()   },
                   { column: 'idleTimeout',     word: $('#idleTimeout').val()   },
                   { column: 'netProtocol',     word: $('#netProtocol').val()   } ];

    if($selc.attr('id') == 'wildcards') index = 0;
    else if($selc.attr('id') == 'dstIP') index = 1;
    else if($selc.attr('id') == 'srcMac') index = 2;
    else if($selc.attr('id') == 'counterByte') index = 3;
    else if($selc.attr('id') == 'srcPort') index = 4;
    else if($selc.attr('id') == 'ingreePort') index = 5;
    else if($selc.attr('id') == 'dstMac') index = 6;
    else if($selc.attr('id') == 'actions') index = 7;
    else if($selc.attr('id') == 'srcIPMask') index = 8;
    else if($selc.attr('id') == 'vlan') index = 9;
    else if($selc.attr('id') == 'dstIPMask') index = 10;
    else if($selc.attr('id') == 'srcIP') index = 11;
    else if($selc.attr('id') == 'counterPacket') index = 12;
    else if($selc.attr('id') == 'dstPort') index = 13;
    else if($selc.attr('id') == 'hardTimeout') index = 14;
    else if($selc.attr('id') == 'idleTimeout') index = 15;
    else if($selc.attr('id') == 'netProtocol') index = 16;
    else ;

    filter[index]["word"] = $selc.val();

    // Do The Real Thing
    $('#flowtable').multiFilter(filter);
}

$('#wildcards').keyup(function() {
    filtering($(this));
});
$('#dstIP').keyup(function() {
    filtering($(this));
});
$('#srcMac').keyup(function() {
    filtering($(this));
});
$('#counterByte').keyup(function() {
    filtering($(this));
});
$('#srcPort').keyup(function() {
    filtering($(this));
});
$('#ingreePort').keyup(function() {
    filtering($(this));
});
$('#dstMac').keyup(function() {
    filtering($(this));
});
$('#actions').keyup(function() {
    filtering($(this));
});
$('#srcIPMask').keyup(function() {
    filtering($(this));
});
$('#vlan').keyup(function() {
    filtering($(this));
});
$('#dstIPMask').keyup(function() {
    filtering($(this));
});
$('#srcIP').keyup(function() {
    filtering($(this));
});
$('#counterPacket').keyup(function() {
    filtering($(this));
});
$('#dstPort').keyup(function() {
    filtering($(this));
});
$('#hardTimeout').keyup(function() {
    filtering($(this));
});
$('#idleTimeout').keyup(function() {
    filtering($(this));
});
$('#netProtocol').keyup(function() {
    filtering($(this));
});
