(function () {

  var deferred = $.when($.getScript("test/lib/jasmine-1.2.0/jasmine.js"));

  var scripts = ["lib/jasmine-1.2.0/jasmine-html.js",
                 "lib/jasmine-1.2.0/jasmine-jquery.js",
                 "test_helper.js",
                 "menu_test.js",
                 "inventory_test.js",
                 "gas_pump_test.js",
                 "gas_can_test.js"];

  _.each(scripts, function (script) {
    deferred = deferred.pipe(function () {
      return $.getScript("test/" + script);
    });
  });

  // have the game running as the starting state
  deferred = deferred.pipe(function () {
    var defer = $.Deferred();
    Game.events.once('game start', function () {
      // clear intro screen
      $('#intro-screen').click();
      defer.resolve();
    });
    $('#new-game').click();
    return defer.promise();
  });

  deferred.then(function () {
    // turn jquery effects off
    $.fx.off = true;

    $('head').append('<link rel="stylesheet" type="text/css" href="test/lib/jasmine-1.2.0/jasmine.css">');

    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    // so we can run something at the end
    jasmineEnv.addReporter({
      reportRunnerResults: function () {
        requirejs(['MainLoop'], function (MainLoop) {
          MainLoop.pause();
          $('#HTMLReporter').siblings().slideUp();
        });
      }
    });

    jasmineEnv.specFilter = function (spec) {
      return htmlReporter.specFilter(spec);
    };

    jasmineEnv.execute();

  }).fail(function () {
    console.log('FAIL!', arguments);
  });

})();
