// Reporter
define(['Game', 'Console', 'World'], function (Game, Console, World) {

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
      Console.error("tried to report on counter that doesn't exist, type: "+type+", desc: "+description);
    }
  };

  var reportCounter = function (type) {
    var counter = counters[type];
    var keys = _.keys(counter);
    var total = 0;
    _.each(keys, function (key) {
      Console.log('\t' + counter[key] + ' ' + key);
      total += counter[key];
    });
    Console.log("\tTOTAL: ", total);
  };

  var report = function () {
    Console.log("Zombies Dispatched:");
    reportCounter('zombie');
    Console.log("\rCars Destroyed:");
    reportCounter('car');
    Console.log("\rShots Fired:");
    reportCounter('shots');
    Console.log("\rItems Consumed:");
    reportCounter('items');
    var gas = Math.round(counters.gasGuzzled);
    var gallons = (gas === 1) ? " Gallon" : " Gallons";
    Console.log("\rGas Guzzled: " + gas + gallons);
    Console.log("\rBarrels Rolled: " + counters.barrelRolled);
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
      incrementCounter('items', type.name || type.clazz);
    },
    counters: function () {
      return counters;
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
  }).subscribe('everything loaded', function () {
    counters = World.getStats();
    if (!counters) {
      resetCounters();
    }
  });

  // save counters before we leave
  $(window).unload(function () {
    World.saveStats(counters);
  });

  return Reporter;
});
