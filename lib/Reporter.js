// Reporter
define(['Game', 'GameTime', 'Console', 'World'], function (Game, GameTime, Console, World) {

  var counters;

  var resetCounters = function () {
    counters = {
      dude:         {},
      zombie:       {},
      car:          {},
      shots:        {},
      items:        {},
      barrelRolled: 0,
      gasGuzzled:   0,
      walked:       0,
      drove:        0,
      distance:     0
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

  var updateDistanceCounter = function () {
    if (Game.dude) {
      counters.distance = Game.dude.distanceFromOrigin();
    }
  };

  var Reporter = {
    dudeDeath: function (description) {
      incrementCounter('dude', description);
    },
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
    walkedDistance: function (distance) {
      counters.walked += distance;
    },
    droveDistance: function (distance) {
      counters.drove += distance;
    },
    goalDistance: function (distance) {
      counters.distance = Math.max(distance, counters.distance);
    },
    counters: function () {
      return counters;
    }
  };

  Game.events.subscribe('firearm discharged', function (firearm) {
    Reporter.shotFired(firearm.description);
  }).subscribe('fuel consumed', function (consumption) {
    Reporter.gasGuzzled(consumption);
  }).subscribe('end frame', function () {
    if (Game.dude) {
      Reporter.goalDistance(Game.dude.distanceFromOrigin());
    }
  }).subscribe('new game', function () {
    resetCounters();
  }).subscribe('everything loaded', function () {
    counters = World.getStats();
  }).subscribe('game over', function () {
    counters.won = Game.dude.alive() && !GameTime.hasElapsed();
  });

  return Reporter;
});
