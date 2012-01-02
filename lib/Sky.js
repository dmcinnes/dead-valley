// The Sky

define(["Game", "Sprite", "GameTime"], function (Game, Sprite, GameTime) {

  var context = Game.skyContext;

  var secondsInADay = GameTime.secondsInADay;

  // in seconds
  var dayTotal        = Math.round(secondsInADay * 0.50);
  var nightTotal      = Math.round(secondsInADay * 0.42);
  var transitionTotal = Math.round(secondsInADay * 0.04); // two of these

  var nightAlpha = 0.90;

  var alpha = nightAlpha;

  var transitionPercent = function (time) {
    var percent = time / transitionTotal;
    if (percent < 0) {
      percent = 0;
    } else if (percent > 1) {
      percent = 1;
    }
    return percent;
  };

  var states = {
    sunrise: function (time) {
      time = time - dayTotal - nightTotal - transitionTotal;
      if (time > 0) {
	alpha = nightAlpha - (nightAlpha * transitionPercent(time));
      }
      // time wraps back to zero
      if (time < 0 || time >= transitionTotal) {
        currentState = states.day;
      }
    },
    day: function (time) {
      alpha = 0;
      if (time >= dayTotal) {
        currentState = states.sunset;
      }
    },
    sunset: function (time) {
      time = time - dayTotal;
      alpha = nightAlpha * transitionPercent(time);
      if (time >= transitionTotal) {
        currentState = states.night;
      }
    },
    night: function (time) {
      time = time - dayTotal - transitionTotal;
      alpha = nightAlpha;
      if (time >= nightTotal) {
        currentState = states.sunrise;
      }
    }
  };

  var currentState = states.day;

  var runCurrentState = function () {
    var time = GameTime.elapsedTime();
    time = time % secondsInADay;
    currentState(time);
  };

  var Sky = {
    preMove: runCurrentState,
    render: function (delta) {
      context.save();
      context.clearRect(0, 0, Game.GameWidth, Game.GameHeight);
      if (alpha > 0) {
        context.globalAlpha = alpha;
        context.fillRect(0, 0, Game.GameWidth, Game.GameHeight);
      }
      context.restore();
    },
    currentAlpha: function () {
      return alpha;
    },
    isDark: function () {
      return alpha > 0.4;
    },
    visible: true,
    onScreen: true,
    z: -Number.MAX_VALUE
  };

  return Sky;
});
