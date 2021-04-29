$(document).ready(function () {
    //create a download all button
    $button = $('<input id="download_logs" type="button" class="btn" value="Download Game Logs" style="margin-bottom:5px">');
    $button.insertAfter('a[name="topper"]');

    //attach event handlers
    $('#download_logs').click(function () {
        if (confirm('This will download game logs for all the games showing below, which may take a long time. Click OK if you would like to continue.')) {

            //get a list of all logs to download
            var log_list = $('a[title="Detailed Play Log"]');

            //disable the button
            $('#download_logs').prop("disabled", true);
            $('#download_logs').prop('value', 'processed log ' + 0 + ' of ' + log_list.length + ' ...');

            //setup variable to track progress
            var done_count = 0;

            //setup variable to aggregate the log data
            var master_log = [];

            //process list
            log_list.each(function () {
                //TODO need a way to indicate week number in the future

                //get 
                $.get(this.href, function (data) {
                    //parse data
                    master_log = master_log.concat(
                        parseLog(
                            $(data).find('center'),
                            $(data).find('#play1').parent()
                        )
                    );

                    //update conter
                    done_count++;

                    //update the progress in the title of the download button
                    $('#download_logs').prop('value', 'processed log ' + done_count + ' of ' + log_list.length + ' ...');

                    if (done_count == log_list.length) {
                        //download the file
                        var league_number = window.location.search.split('myleagueno=')[1].split('#')[0];
                        download(json2csv(master_log), 'gamelogs_lg_' + league_number + '.csv', 'text.csv')

                        //enable the button and reset it's title
                        $('#download_logs').prop('value', 'Download Game Logs');
                        $('#download_logs').prop("disabled", false);
                    }
                });
            });
        }

    });
});