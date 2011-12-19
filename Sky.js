// The Sky

define(["Game", "Sprite", "GameTime"], function (Game, Sprite, GameTime) {

  var context = Game.skyContext;

  var secondsInADay = GameTime.secondsInADay;

  // in seconds
  var dayTotal        = Math.round(secondsInADay * 0.50);
  var nightTotal      = Math.round(secondsInADay * 0.42);
  var transitionTotal = Math.round(secondsInADay * 0.04); // two of these

  var counter = dayTotal;

  var nightAlpha = 0.90;

  var alpha = nightAlpha;

  var transitionPercent = function () {
    var percent = (transitionTotal - counter) / transitionTotal;
    if (percent < 0) {
      percent = 0;
    }
    if (percent > 1) {
      percent = 1;
    }
    return percent;
  };

  var states = {
    sunrise: function () {
      alpha = nightAlpha - (nightAlpha * transitionPercent());
      if (counter < 0) {
        counter = dayTotal;
        currentState = states.day;
      }
    },
    day: function () {
      alpha = 0;
      if (counter < 0) {
        counter = transitionTotal;
        currentState = states.sunset;
      }
    },
    sunset: function () {
      alpha = nightAlpha * transitionPercent();
      if (counter < 0) {
        counter = nightTotal;
        currentState = states.night;
      }
    },
    night: function () {
      alpha = nightAlpha;
      if (counter < 0) {
        counter = transitionTotal;
        currentState = states.sunrise;
      }
    }
  };

  var currentState = states.day;

  var Sky = {
    preMove: function (delta) {
      counter -= delta;
      currentState();
    },
    render: function (delta) {
      context.save();
      context.clearRect(0, 0, Game.GameWidth, Game.GameHeight);
      context.globalAlpha = alpha;
      context.fillRect(0, 0, Game.GameWidth, Game.GameHeight);
      context.restore();
    },
    currentAlpha: function () {
      return alpha;
    },
    gotoNextState: function () {
      counter = -1;
      currentState();
    },
    isDark: function () {
      return alpha > 0.4;
    },
    visible: true,
    z: -Number.MAX_VALUE
  };

  // for testing
  Game.events.subscribe('transition sky', function () {
    Sky.gotoNextState();
  });
  
  return Sky;
});
