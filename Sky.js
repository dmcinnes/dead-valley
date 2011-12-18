// The Sky

define(["Game", "Sprite", "GameTime"], function (Game, Sprite, GameTime) {

  var context = Game.skyContext;

  var secondsInADay = GameTime.secondsInADay;

  // in seconds
  var dayTotal        = Math.round(secondsInADay * 0.54);
  var nightTotal      = Math.round(secondsInADay * 0.38);
  var transitionTotal = Math.round(secondsInADay * 0.08);

  var counter = dayTotal;

  var nightAlpha = 0.90;

  var alpha = nightAlpha;

  var transitionPercent = function () {
    return (transitionTotal - counter) / transitionTotal;
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
      alpha = 0.0;
      if (counter < 0) {
        counter = transitionTotal;
        currentState = states.sunset;
      }
    },
    sunset: function () {
      alpha = nightAlpha * transitionPercent();
      if (counter < 0) {
        counter = dayTotal;
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
