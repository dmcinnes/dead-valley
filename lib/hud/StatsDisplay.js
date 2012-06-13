require(['Game', 'Reporter'], function (Game, Reporter) {

  var $stats        = $('#stats-screen');
  var $statsContent = $('#stats-content');

  var renderTable = function (report, title) {
    var table = $('<table>');

    var total = _.reduce(report, function (memo, num) { return memo + num; }, 0);

    table.append(
      $('<tr>').addClass('heading').append(
        $('<td>').text(title),
        $('<td>').text(total || 'NONE')
      )
    );

    var pairs = _.map(report, function (v, k) { return [k,v]; });
    pairs = _.sortBy(pairs, function (p) { return p[1]; });
    pairs.reverse();

    _.each(pairs, function (pair) {
      table.append(
        $('<tr>').append(
          $('<td colspan="1">').text(pair[1] + ' ' + pair[0])
        )
      );
    });

    return table;
  };

  var report = function () {
    var counters = Reporter.counters();
    $statsContent.append(renderTable(counters.zombie, "Zombies Dispatched:"));
    $statsContent.append(renderTable(counters.car, "Cars Destroyed:"));
    $statsContent.append(renderTable(counters.shots, "Shots Fired:"));
    $statsContent.append(renderTable(counters.items, "Items Consumed:"));
    var gas = Math.round(counters.gasGuzzled);
    var gallons = (gas === 1) ? " Gallon" : " Gallons";
    var table = $('<table>');
    table.append(
      $('<tr>').append(
        $('<td>').text("Gas Guzzled:"),
        $('<td>').text(gas + gallons)
      ),
      $('<tr>').append(
        $('<td>').text("Barrels Rolled:"),
        $('<td>').text(counters.barrelRolled)
      )
    );
    $statsContent.append(table);

    var height = $stats.height();
    $stats.css('top', -(height/2)+'px');

    $stats.show();
  };

  Game.events.subscribe('game over', report);

});
