// Reporter
define(function () {
  var zombieDeaths = {};

  var Reporter = {
    zombieDeath: function (description) {
      if (!zombieDeaths[description]) {
        zombieDeaths[description] = 0;
      }
      zombieDeaths[description]++;
      console.log('REPORT: ' + description);
    },
    carDestruction: function (car) {
    },
    barrelRolled: function () {
    },
    gasGuzzled: function (amount) {
    },
    shotFired: function (type) {
    },
    foodEaten: function (type) {
    },
    report: function () {
      var keys = _.keys(zombieDeaths);
      _.each(keys, function (key) {
        console.log(key + '\t' + zombieDeaths[key]);
      });
    }
  };

  return Reporter;
});
