var fields = [];
var fieldTypes = {};

function checkClass($elem) {
    for(var i = 0; i < fields.length; i++)
        if($elem.hasClass('Mismatched_' + i))
            return true;
    return false;
};

function togglePrecense($tr) {
    for(var i = 0; i < $tr.length; i++)
        if(checkClass($tr.eq(i)))
            $tr.eq(i).hide();
        else
            $tr.eq(i).show();
}

function matching($row, index, data, input) {
    if(input === "")
        $row.removeClass('Mismatched_' + index);
    else if(fieldTypes[fields[index]] === "int")
        if(data != input)
            $row.addClass('Mismatched_' + index);
        else
            $row.removeClass('Mismatched_' + index);
    else
        if(data.indexOf(input) == -1)
            $row.addClass('Mismatched_' + index);
        else
            $row.removeClass('Mismatched_' + index);
}

function preMatching($tr, $input) {
    var sievers = $input.filter(function() {
        return $(this).val() !== "";
    });

    $tr.each(function() {
        var $thisTr = $(this);
        sievers.each(function() {
            var index = fields.indexOf(this.id),
                tdText = $thisTr.children('td').eq(index).text(),
                inputText = this.value;
            matching($thisTr, index, tdText, inputText);
        });
    });

    togglePrecense($tr);
}

function postMatching(value, index, $tr) {
    $tr.each(function() {
        var tdText = $(this).children('td').eq(index).text();
        matching($(this), index, tdText, value);
    });

    togglePrecense($tr);
}

$(document).ready(function() {
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
