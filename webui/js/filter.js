(function ($) {
    var fields = [ 'wildcards', 'dstIP', 'srcMac', 'counterByte', 'srcPort',
                   'ingressPort', 'dstMac', 'actions', 'srcIPMask', 'vlan',
                   'dstIPMask', 'srcIP', 'counterPacket', 'dstPort',
                   'hardTimeout', 'idleTimeout', 'netProtocol' ];

    var checkClass = function($elem) {
        for(var i = 0; i < fields.length; i++)
            if($elem.hasClass('Mismatched_' + i))
                return true;
        return false;
    };

    var togglePrecense = function($tr) {
        for(var i = 0; i < $tr.length; i++)
            if(checkClass($tr.eq(i)))
                $tr.eq(i).hide();
            else
                $tr.eq(i).show();
    }

    preMatching = function($tr, $input) {
        var sievers = $input.filter(function() {
            return $(this).val() !== "";
        });

        $tr.each(function() {
            var $thisTr = $(this);
            sievers.each(function() {
                var index = fields.indexOf(this.id),
                    tdText = $thisTr.children('td').eq(index).text(),
                    inputText = this.value;
                if(tdText.indexOf(inputText) == -1)
                    $thisTr.addClass('Mismatched_' + index);
                else
                    $thisTr.removeClass('Mismatched_' + index);
            });
        });

        togglePrecense($tr);
    }

    var postMatching = function(value, index, $tr) {
        $tr.each(function() {
            if($(this).children('td').eq(index).text().indexOf(value) == -1)
                $(this).addClass('Mismatched_' + index);
            else
                $(this).removeClass('Mismatched_' + index);
        });

        togglePrecense($tr);
    }

    $().ready(function() {
        $('input').keyup(function() {
            postMatching(
                $(this).val(),
                fields.indexOf($(this).attr('id')),
                $('table#flowtable tbody tr')
            );
        });
    });
})(jQuery);
