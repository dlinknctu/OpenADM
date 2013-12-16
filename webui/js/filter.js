(function ($) {
    var fields = [];
    var fieldTypes = {};
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
                if(inputText === "")
                    $thisTr.removeClass('Mismatched_' + index);
                else if(fieldTypes[fields[index]] === "int")
                    if(tdText != inputText)
                        $thisTr.addClass('Mismatched_' + index);
                    else
                        $thisTr.removeClass('Mismatched_' + index);
                else
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
            var tdText = $(this).children('td').eq(index).text();
            if(value === "")
                $(this).removeClass('Mismatched_' + index);
            else if(fieldTypes[fields[index]] === "int")
                if(tdText != value)
                    $(this).addClass('Mismatched_' + index);
                else
                    $(this).removeClass('Mismatched_' + index);
            else
                if(tdText.indexOf(value) == -1)
                    $(this).addClass('Mismatched_' + index);
                else
                    $(this).removeClass('Mismatched_' + index);
        });

        togglePrecense($tr);
    }

    $().ready(function() {
        (function() {
            $header = $('#flowtable thead tr:first-child');
            $header.children('th').each(function() {
                fields.push($(this).text());
                fieldTypes[$(this).text()] = $(this).attr('data-sort');
            });
        }());

        $('input').keyup(function() {
            postMatching(
                $(this).val(),
                fields.indexOf($(this).attr('id')),
                $('table#flowtable tbody tr')
            );
        });
    });
})(jQuery);
