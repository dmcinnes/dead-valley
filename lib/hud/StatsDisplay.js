require(['Game', 'Reporter'], function (Game, Reporter) {

  var $stats        = $('#stats-screen');
  var $statsContent = $('#stats-content');

  var renderSection = function (report, title) {
    var total = _.reduce(report, function (memo, num) { return memo + num; }, 0) || 'NONE';

    var $header = $('<h2>').text(title + ' ' + total);

    $statsContent.append($header);

    var pairs = _.map(report, function (v, k) { return [k,v]; });
    pairs = _.sortBy(pairs, function (p) { return p[1]; });
    pairs.reverse();

    _.each(pairs, function (pair) {
      $statsContent.append($('<p>').text(pair[1] + ' ' + pair[0]));
    });
  };

  var report = function () {
    $statsContent.empty();

    var counters = Reporter.counters();
    renderSection(counters.zombie, "Zombies Dispatched:");
    renderSection(counters.car, "Cars Destroyed:");
    renderSection(counters.shots, "Shots Fired:");
    renderSection(counters.items, "Items Consumed:");

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
