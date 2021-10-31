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
        checked = $('input[type="checkbox"].csv_checkbox:checked').length;

        if (!checked) {
            $('#download_csv').prop("disabled", true);
        } else {
            $('#download_csv').prop("disabled", false);
        }
    });

    var logid = getUrlParameter(window.location.href, "viewpbp");

    //attach event handlers
    $('#download_csv').click(function(){
        let getlogs = $('input[type="checkbox"]#download_logs').prop("checked");
        let getlineups = $('input[type="checkbox"]#download_lineups').prop("checked");

        let parsed_log = parseLog( 
            $('center'),
            $('#play1').parent(),
            logid,
            getlogs,
            getlineups
        );
        
        let edited_log = [];
        let lineups = [];
        parsed_log.forEach(function(play) {
            if(getlogs) {
                let edited_play = {
                    ...play.identifiers,
                    ...play.results
                }
                edited_log.push(edited_play);
            }
            if (getlineups && (play.results.play_type == "pass" || play.results.play_type == "run")) {
                let lineup = {
                    ...play.identifiers,
                    off_team: play.results.off_team,
                    def_team: play.results.def_team,
                    off_package: play.results.off_package,
                    off_subpackage: play.results.off_subpackage,
                    def_package: play.results.def_package,
                    ...play.lineups
                }
                lineups.push(lineup);
            }
        });

        if (getlogs) {
            download(json2csv(edited_log), 'gamelog_' + window.location.search.split('viewpbp=')[1] + '.csv', 'text.csv');
        }
        if (getlineups) {
            download(json2csv(lineups), 'gamelineups_' + window.location.search.split('viewpbp=')[1] + '.csv', 'text.csv');
        }
    });
});

