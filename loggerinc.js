$(document).ready(function () {
    //create a button
    $button = $('<input id="download_csv" type="button" style="font-size: 10pt; font-weight: bold; height: 30px;" value="Download CSV" >');
    $button.prependTo('#mainSpan');

    var logid = getUrlParameter(window.location.href, "viewpbp");

    //attach event handlers
    $('#download_csv').click(function(){
        let parsed_log = parseLog( 
            $('center'),
            $('#play1').parent(),
            logid
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

