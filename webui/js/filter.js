(function ($) {
    var fields = [ 'wildcards', 'dstIP', 'srcMac', 'counterByte', 'srcPort',
                   'ingreePort', 'dstMac', 'actions', 'srcIPMask', 'vlan',
                   'dstIPMask', 'srcIP', 'counterPacket', 'dstPort',
                   'hardTimeout', 'idleTimeout', 'netProtocol' ];

    var setLabel = function($elem) {
        for(var i = 0; i < fields.length; i++)
            if($elem.hasClass('Matched' + i))
                return true;
        return false;
    };

    var togglePrecense = function($tr) {
        for(var i = 0; i < $tr.length; i++)
            if(setLabel($tr.eq(i)))
                $tr.eq(i).hide();
            else
                $tr.eq(i).show();
    }

    $().ready(function() {
        $('input').keyup(function(e) {
            var value = $(this).val();
            var index = fields.indexOf($(this).attr('id'));
            var $tr = $('#flowtable tbody tr');
            
            $tr.each(function (e) {
                if($(this).children('td').eq(index).text().indexOf(value) == -1)
                    $(this).addClass('Matched' + index); 
                else
                    $(this).removeClass('Matched' + index);
            });

            togglePrecense($tr);
        });
    });
})(jQuery);
