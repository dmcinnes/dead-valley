// Reporter
define(function () {
  var zombieDeaths = {};

  var Reporter = {
    reportZombieDeath: function (description) {
      if (!zombieDeaths[description]) {
        zombieDeaths[description] = 0;
      }
      zombieDeaths[description]++;
      // console.log('REPORT: ' + description);
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
