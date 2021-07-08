$(document).ready(function () {
    //re-style all existing buttons to remove percentage widths
    $('td[width="33%"], td[width="34%"]').each(function () {
        $(this).removeAttr('width align');
    });

    //get a list of all logs on page
    $('a[title="Detailed Game Log"]').each(function () {
        //create a button
        $button = $('<td width="50px" bgcolor="white" valign="center""><a class="download_csv" href=""><img src="https://static.thenounproject.com/png/632140-200.png"></a></td>');
        $button.insertAfter($(this).parent());
        $button.find('a:eq(0)').attr('href', this.href);
    });

    //attach event handlers
    $('a.download_csv').each(function () {
        $(this).click(function (event) {
            event.preventDefault();

            //save href before removing button
            var href = this.href;

            var logid = getUrlParameter(href, "viewpbp");

            //change out button to a loading icon
            $(this).find('img:eq(0)').attr('src','https://www.stonebridgehomesnw.com/images/loading.gif');

            $.get(href, function (data) {
                //parse data
                var json_data = parseLog(
                    $(data).find('center'),
                    $(data).find('#play1').parent(),
                    logid
                );

                //download data
                download(json2csv(json_data), 'gamelog_' + this.url.split('viewpbp=')[1] + '.csv', 'text.csv');

                //update icon
                $('a[href="' + this.url + '"]:eq(0)').find('img:eq(0)').attr('src','https://cdn0.iconfinder.com/data/icons/harmonicons-02/64/check-box-128.png');
            });

            return false;
        });
    });
});