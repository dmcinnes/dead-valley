require(['Game', 'Reporter'], function (Game, Reporter) {

  var $stats        = $('#stats-screen');
  var $statsContent = $('#stats-content');

  var deathStrings = [' ', 'Twice', 'Thrice'];

  var deathString = function (count) {
    return deathStrings[count-1] || (count + ' Times');
  };

  var renderSection = function (report, title, countString, postNumbers) {
    if (!countString) {
      countString = _.reduce(report, function (memo, num) { return memo + num; }, 0) || 'NONE';
    }

    var $header = $('<h2>').text(title + ' ' + countString);

    $statsContent.append($header);

    var pairs = _.map(report, function (v, k) { return [k,v]; });
    pairs = _.sortBy(pairs, function (p) { return p[1]; });
    pairs.reverse();

    _.each(pairs, function (pair) {
      var string;
      if (postNumbers) {
        string = pair[1] == 1 ? pair[0] : pair[0] + ' (' + deathString(pair[1]) + ')';
      } else {
        string = pair[1] + ' ' + pair[0];
      }
      $statsContent.append($('<p>').text(string));
    });
  };

  var report = function () {
    $statsContent.empty();

    var counters = Reporter.counters();

    var deathCount = _.reduce(counters.dude, function (memo, num) { return memo + num; }, 0);
    if (deathCount > 0) {
      renderSection(counters.dude, "You Were Killed", deathString(deathCount), true);
    }

    renderSection(counters.zombie, "Zombies Dispatched:");
    renderSection(counters.car,    "Cars Destroyed:");
    renderSection(counters.shots,  "Shots Fired:");
    renderSection(counters.items,  "Items Consumed:");

    var gas = Math.round(counters.gasGuzzled);
    var gallons = (gas === 1) ? " Gallon" : " Gallons";
    var table = $('<table>');

    $statsContent.append($('<h2>').text("Gas Guzzled: " + (gas + gallons) ));
    $statsContent.append($('<h2>').text("Barrels Rolled: " + counters.barrelRolled));
  };

  Game.events.subscribe('game over', report);

  Game.events.subscribe('showing screen', function (screen) {
    if (screen === 'stats') {
      report();
    }
  });

});
