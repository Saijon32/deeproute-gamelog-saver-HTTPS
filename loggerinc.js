$(document).ready(function () {
    // create a button and checkboxes to select what data to download
    $download_panel = $('<div id="csv_download_panel">');
    $logbox_span = $('<span id="csv_log_checkbox">');
    $lineupbox_span = $('<span id="csv_lineup_checkbox">');

    $download_panel.prependTo('#mainSpan');
    $download_panel.append('<input id="download_csv" type="button" value="Download CSV" >');
    $download_panel.append("<br/>");
    $download_panel.append($logbox_span);
    $download_panel.append($lineupbox_span);
    $logbox_span.append('<input id="download_logs" class="csv_checkbox" type="checkbox" value="logs" checked>');
    $logbox_span.append('<label for="download_logs"> Logs</label>');
    $lineupbox_span.append('<input id="download_lineups" class="csv_checkbox" type="checkbox" value="lineups">');
    $lineupbox_span.append('<label for="download_lineups"> Lineups</label>');

    $(document).on("click", "input.csv_checkbox", function () {
        console.log("Called the anonymous function!");
        checked = $('input[type="checkbox"].csv_checkbox:checked').length;

        if (!checked) {
            $('#download_csv').prop("disabled", true);
            console.log("No boxes are checked. The button should be disabled!");
        } else {
            $('#download_csv').prop("disabled", false);
            console.log("Some boxes are checked. The button should be active!");
        }
    });

    var logid = getUrlParameter(window.location.href, "viewpbp");

    //attach event handlers
    $('#download_csv').click(function(){
        let parsed_log = parseLog( 
            $('center'),
            $('#play1').parent(),
            logid,
            true,
            false
        );
        //console.log(parsed_log);
        let edited_log = [];
        let lineups = [];
        parsed_log.forEach(function(play) {
            let edited_play = {
                ...play.identifiers,
                ...play.results
            }
            edited_log.push(edited_play);
        });
        //console.log(edited_log);
        download(
            json2csv(
                edited_log
            ), 
            'gamelog_' + window.location.search.split('viewpbp=')[1] + '.csv', 'text.csv'
        )
    });
});

