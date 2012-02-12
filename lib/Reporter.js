// Reporter
define(['Game'], function (Game) {

  var counters;

  var resetCounters = function () {
    counters = {
      zombie: {},
      car: {},
      shots: {},
      barrelRolled: 0,
      gasGuzzled: 0,
      items: {}
    };
  };

  var incrementCounter = function (type, description) {
    var counter = counters[type];
    if (counter) {
      if (!counter[description]) {
        counter[description] = 0;
      }
      counter[description]++;
    } else {
      console.error("tried to report on counter that doesn't exist, type: "+type+", desc: "+description);
    }
  };

  var reportCounter = function (type) {
    var counter = counters[type];
    var keys = _.keys(counter);
    var total = 0;
    _.each(keys, function (key) {
      console.log('\t' + key + '\t' + counter[key]);
      total += counter[key];
    });
    console.log("\tTOTAL: ", total);
  };

  var report = function () {
    console.log("Dispatched Zombies:");
    reportCounter('zombie');
    console.log("\rDestroyed Cars:");
    reportCounter('car');
    console.log("\rShots Fired:");
    reportCounter('shots');
    console.log("\rItems Consumed:");
    reportCounter('items');
    console.log("\rGas Guzzled: " + counters.gasGuzzled);
    console.log("\rBarrels Rolled: " + counters.barrelRolled);
  };

  var Reporter = {
    zombieDeath: function (description) {
      incrementCounter('zombie', description);
    },
    carDestruction: function (description) {
      incrementCounter('car', description);
    },
    barrelRolled: function () {
      counters.barrelRolled++;
    },
    gasGuzzled: function (amount) {
      counters.gasGuzzled += amount;
    },
    shotFired: function (type) {
      incrementCounter('shots', type);
    },
    itemConsumed: function (type) {
      incrementCounter('items', type.clazz);
    }
  };

  Game.events.subscribe('firearm discharged', function (firearm) {
    Reporter.shotFired(firearm.description);
  }).subscribe('fuel consumed', function (consumption) {
    Reporter.gasGuzzled(consumption);
  }).subscribe('game start', function () {
    resetCounters();
  }).subscribe('game over', function () {
    report();
  });


  return Reporter;
});
