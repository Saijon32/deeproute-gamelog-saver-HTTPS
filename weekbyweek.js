$(document).ready(function () {
    //create a download all button
    $button = $('<input id="download_games" type="button" class="btn" value="Download Games" >');

    $download_panel = $('<div id="csv_download_panel">');
    $logbox_span = $('<span id="csv_log_checkbox">');
    $lineupbox_span = $('<span id="csv_lineup_checkbox">');

    $download_panel.insertAfter('a[name="topper"]');
    //$download_panel.prependTo('#mainSpan');
    $download_panel.append($button);
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
            $('#download_games').prop("disabled", true);
        } else {
            $('#download_games').prop("disabled", false);
        }
    });

    //attach event handlers
    $('#download_games').click(function () {
        if (confirm('This will download game logs for all the games showing below, which may take a long time. Click OK if you would like to continue.')) {

            //get a list of all logs to download
            var log_list = $('a[title="Detailed Play Log"]');

            //disable the button
            $('#download_games').prop("disabled", true);
            $('.csv_checkbox').prop("disabled", true);
            $('#download_games').prop('value', 'processed log ' + 0 + ' of ' + log_list.length + ' ...');

            //setup variable to track progress
            var done_count = 0;

            //setup variable to aggregate the log data
            var master_log = [];

            //process list
            log_list.each(function () {
                //TODO need a way to indicate week number in the future

                var logid = getUrlParameter(this.href, "viewpbp");

                //get 
                $.get(this.href, function (data) {
                    //parse data
                    master_log = master_log.concat(
                        parseLog(
                            $(data).find('center'),
                            $(data).find('#play1').parent(),
                            logid,
                            true,
                            true
                        )
                    );

                    //update conter
                    done_count++;

                    //update the progress in the title of the download button
                    $('#download_games').prop('value', 'processed log ' + done_count + ' of ' + log_list.length + ' ...');

                    if (done_count == log_list.length) {
                        edited_log = [];
                        master_log.forEach(function(play) {
                            let edited_play = {
                                ...play.identifiers,
                                ...play.results
                            }
                            edited_log.push(edited_play);
                        });

                        //download the file
                        var league_number = window.location.search.split('myleagueno=')[1].split('#')[0];
                        download(json2csv(edited_log), 'gamelogs_lg_' + league_number + '.csv', 'text.csv')

                        //enable the button and reset it's title
                        $('#download_games').prop('value', 'Download Games');
                        $('#download_games').prop("disabled", false);
                        $('.csv_checkbox').prop("disabled", false);
                    }
                });
            });
        }

    });
});