//main function used to parse the table element containing the game log
function parse_log(log_table) {
  var game_log = [];

  //format data into searchable jquery object
  $log_data = $(log_table);

  $start = $log_data.find('td[colspan="100%"]:eq(0)').parent();
  $stop_list = $log_data.find('td[bgcolor="#000000"], td[bgcolor="#eeee99"], td:contains("FAILED to convert the 2 Point Conversion")').parent();

  //get list of teams playing
  teams = [];
  teams.push($log_data.find('td[colspan="100%"]:contains("- Q1"):eq(0)').text().split(' - ')[0].trim());
  teams.push($log_data.find('td[colspan="100%"]:contains("- Q3"):eq(0)').text().split(' - ')[0].trim());

  //loop through each section
  for (i = 0; i < $stop_list.length; i++) {

    //get list of elements to read
    $rows = $start.nextUntil($stop_list.eq(i));

    //check for valid play
    if ($rows.find('td:contains("- The ball is snapped to")').length == 1) {

      //get scenario
      snap = $rows.find('td:contains("- The ball is snapped to")').text().split(' - ');
      off_team = snap[0].trim();
      if (off_team == teams[0]) {
        def_team = teams[1];
      } else {
        def_team = teams[0];
      }
      qtr = snap[1].split(' ')[0].split('Q')[1].trim();
      time = snap[1].split(' ')[1].trim();
      down = snap[1].split('(')[1].split('and')[0].trim();
      dist = snap[1].split('(')[1].split(';')[0].split('and')[1].trim();
      yard_line = snap[1].split(';')[1].split(')')[0].trim();
      // score = ??????       

      //get playcalls
      plays = $rows.find('td:contains("Offensive Package Was :")').text().split('Offensive Package Was :')[1];

      //offensive playcall
      off = plays.split('Defensive Package Was :')[0].split(':');
      off_pkg = off[0].split(',')[0].trim();
      off_formation = off[1].split(',')[0].trim();
      off_play = off[2].trim();

      //reset variable values for new play
      pass_type = '';
      pass_result = '';
      first_read = '';
      first_target = '';
      final_target = '';
      scramble_type = '';
      pass_yards = '';
      yac = '';
      runner = '';
      hole = '';
      run_type = '';
      is_touchdown = 0;

      //defensive playcall
      def = plays.split('Defensive Package Was :')[1];
      def_pkg = def.split('Coverage :')[0].trim();
      def_coverage = def.split('Coverage :')[1].split('Blitzing :')[0].trim().split(';');
      cvr_type = def_coverage[0].trim();
      if (def_coverage.length == 2) {
        roamer_job = 'none';
        cvr_depth = def_coverage[1].trim();
      } else {
        roamer_job = (def_coverage[1].indexOf('Roamer Job') > -1 ? def_coverage[1].split('-')[1].trim() : def_coverage[1].trim());
        cvr_depth = def_coverage[2].trim();
      }
      // break down coverage ??
      def_blitz = (def.split('Blitzing :')[1] ? def.split('Blitzing :')[1].trim().replace(/, /g, '+') : 'none');

      // check for offensive touchdowns
      if ($rows.find('td:contains("Touchdown")').length > 0) {
        is_touchdown = 1;
      }

      //check for run vs pass
      if ($rows.find('td:contains("Handoff")').length > 0 || $rows.find('td:contains(" handoff ")').length > 0 || $rows.find('td:contains("keeps it")').length > 0) {
        play_type = 'run';

        //runner
        if ($rows.find('td:contains("keeps it")').length > 0) {
          runner = 'QB';
          run_type = 'keeper';
        } else if ($rows.find('td:contains("Handoff")').length > 0) {
          runner = $rows.find('td:contains("Handoff")').text().split('Handoff to ')[1].split(' ')[0].trim();
          run_type = 'handoff';
        } else {
          // indicates a fumble on the handoff
          runner = $rows.find('td:contains(" handoff ")').text().split(' to ')[1].split(' ')[0].trim();
          run_type = 'fumbled handoff';
        }

        //hole
        if (off_play.indexOf('R1') > -1) {
          hole = 'R1';
        } else if (off_play.indexOf('R2') > -1) {
          hole = 'R2';
        } else if (off_play.indexOf('R3') > -1) {
          hole = 'R3';
        } else if (off_play.indexOf('L1') > -1) {
          hole = 'L1';
        } else if (off_play.indexOf('L2') > -1) {
          hole = 'L2';
        } else if (off_play.indexOf('L3') > -1) {
          hole = 'L3';
        } else if (off_play.toLowerCase().indexOf('sweep') > -1) {
          hole = 'sweep';
        } else if (off_play.toLowerCase().indexOf('sneak') > -1) {
          hole = 'sneak';
        } else {
          hole = 'inside';
        }

        //yards total
        if (run_type != "fumbled handoff") {
          total_yards = getYards($rows.find('td:contains("ard(s)"):eq(0)').text().match(/(-?\d+\s\d+ Yard)/i)[0].split(' Yard')[0]);
        } else {
          // this is wrong, unfortunately the actual yardage gained/lost is nontrivial to determine and a filler value will break things
          // In the future, this should be replaced with yardage derived from the change in field position. 
          total_yards = 0;
        }

      } else {
        play_type = 'pass';

        //pass type
        if ($rows.find('td:contains("SACKED")').length > 0) {
          pass_type = 'sack';
        } else if ($rows.find('td:contains(" and has decided to run!")').length > 0) {
          // it should be possible to have a play which is both a sack and a scramble
          pass_type = 'scramble';
        } else if ($rows.find('td:contains("threw the ball away")').length > 0) {
          pass_type = 'throw away';
        } else if ($rows.find('td:contains("dump it off")').length > 0) {
          pass_type = 'dump off';
        } else {
          pass_type = 'target';
        }

        // pass result
        if ($rows.find('td:contains("DROPPED")').length > 0) {
          pass_result = 'drop';
        } else if ($rows.find('td:contains("pass defended")').length > 0) {
          pass_result = 'pass defended';
        } else if ($rows.find('td:contains("batted down")').length > 0) {
          pass_result = 'batted pass';
        } else if ($rows.find('td:contains("INTERCEPTED")').length > 0) {
          pass_result = 'intercepted';
        } else if ($rows.find('td:contains("INCOMPLETE")').length > 0) {
          pass_result = 'miss';
        } else if ($rows.find('td:contains("COMPLETE")').length > 0) {
          pass_result = 'catch';
        } else {
          pass_result = 'undefined';
        }

        //1st read status
        if ($rows.find('td:contains("decided against throwing")').length > 0) {
          first_read = 'covered';
        } else if (pass_result == 'throw away') {
          first_read = 'none';
        } else {
          first_read = 'open';
        }

        // scrambles
        scramble_type = '';
        if (pass_type == 'scramble' || pass_type == "sack") {
          if ($rows.find('td:contains(" under pressure from the Right side ")').length > 0) {
            scramble_type = 'pressure right';
          } else if ($rows.find('td:contains(" under pressure from the Left side ")').length > 0) {
            scramble_type = 'pressure left';
          } else if ($rows.find('td:contains(" doesn\'t see anyone open ")').length > 0) {
            scramble_type = 'coverage';
          }
        }

        //targets
        if ($rows.find('td:contains("primary option was")').length > 0) {
          first_target = $rows.find('td:contains("primary option was")').text().split('primary option was ')[1].split(' ')[0].trim();
          td = $rows.find('td:contains("Pass by")');
          if (td.length > 0) {
            if (td.text().indexOf('DROPPED') > -1) {
              final_target = td.text().split('DROPPED by ')[1].split(' ')[0].trim();
            } else if (pass_type == 'throw away') {
              final_target = 'none';
            } else if (pass_result == 'catch') {
              td = $rows.find('td:contains("COMPLETE")');
              if (td.text().includes("AMAZING")) {
                final_target = td.text().split(' by ')[1].split(' ')[0].trim();
              } else {
                final_target = td.text().split(' to ')[1].split(' ')[0].trim();
              }
            } else if (pass_result == 'batted pass') {
              final_target = td.text().split(',to ')[1].split(' ')[0].trim();
            } else {
              final_target = td.text().split(' to ')[1].split(' ')[0].trim();
            }
          } else {
            final_target = 'none';
          }
        } else {
          td = $rows.find('td:contains("Pass by")');
          if (td.length == 0) {
            td = $rows.find('td:contains("pass from")');
          }
          if (td.length > 0) {
            if (pass_result == 'drop') {
              first_target = td.text().split('DROPPED by ')[1].split(' ')[0].trim();
            } else if (pass_type == 'throw away') {
              first_target = 'none';
            } else if (pass_result == 'catch') {
              td = $rows.find('td:contains("COMPLETE")');
              if (td.text().includes("AMAZING")) {
                first_target = td.text().split(' by ')[1].split(' ')[0].trim();
              } else {
                first_target = td.text().split(' to ')[1].split(' ')[0].trim();
              }
            } else if (pass_result == 'batted pass') {
              final_target = td.text().split(',to ')[1].split(' ')[0].trim();
            } else {
              first_target = td.text().split(' to ')[1].split(' ')[0].trim();
            }
            final_target = first_target;
          } else {
            first_read = 'none'; //modifies previous variable for special case
            first_target = 'none';
            final_target = 'none';
          }
        }

        //yardage
        td = $rows.find('td:contains("ard(s)")');
        if (td.length == 0) {
          td = $rows.find('td:contains("SACKED")'); //special case for a sack
        }
        if (td.length > 0) {
          //was there a pass
          if (final_target != 'none') {
            pass_yards = getYards(td.text().match(/(-?\d+\s\d+ Yard)/i)[0].split(' yard')[0]);

            //was it complete
            if (pass_result == 'catch') {
              total_yards = getYards(td.text().split('COMPLETE')[1].match(/(-?\d+\s\d+ Yard)/i)[0].split(' Yard')[0]);
              yac = (total_yards - pass_yards).toFixed(2);
            } else {
              total_yards = 0;
              yac = 0;
            }
          } else {
            pass_yards = 0;
            yac = 0;
            total_yards = getYards(td.text().match(/(-?\d+\s\d+ yard)/i)[0].split('ard')[0]);
          }
        } else {
          pass_yards = 0;
          total_yards = 0;
          yac = 0;
        }

      }

      //write data
      var play = {
        quarter: qtr,
        time: time,
        down: down,
        distance: dist,
        yard_line: yard_line,
        off_team: off_team,
        off_package: off_pkg,
        off_formation: off_formation,
        off_play: off_play,
        play_type: play_type,
        def_team: def_team,
        def_package: def_pkg,
        cover_type: cvr_type,
        cover_depth: cvr_depth,
        roamer_job: roamer_job,
        def_blitzer: def_blitz,
        total_yards: total_yards,
        runner: runner,
        hole: hole,
        run_type: run_type,
        pass_type: pass_type,
        pass_result: pass_result,
        first_read: first_read,
        first_target: first_target,
        final_target: final_target,
        scramble_type: scramble_type,
        target_distance: pass_yards,
        yards_after_catch: yac,
        is_touchdown: is_touchdown
      };
      game_log.push(play);

    }

    //update start point
    $start = $stop_list.eq(i);
  }
  return game_log;

}

//helper function to get yardage
function getYards(yd_str) {
  if (yd_str.indexOf('-') > -1) {
    c = -1;
  } else {
    c = 1;
  }
  a = parseFloat(yd_str.match(/\d+/));
  b = parseFloat(yd_str.match(/\s\d+/));
  return (c * (a + b / 100)).toFixed(2);
}

//helper function to download files
function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {
    type: contentType
  });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

//helper function to convert json object to csv
function json2csv(json) {
  var csv = Object.keys(json[0]).join(',') + '\n';
  json.forEach(function (json_record) {
    csv += Object.values(json_record).join(',') + '\n';
  });
  return csv;
}