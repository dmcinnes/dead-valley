// The Sky

define(["Game", "Sprite", "GameTime", "EventMachine"], function (Game, Sprite, GameTime, EventMachine) {

  var context = Game.skyContext;

  // warm up the canvas
  // otherwise it give a nasty pause when first used
  context.fillRect(0, 0, Game.GameWidth, Game.GameHeight);
  context.clearRect(0, 0, Game.GameWidth, Game.GameHeight);

  var secondsInADay = GameTime.secondsInADay;

  // in seconds
  var dayTotal        = Math.round(secondsInADay * 0.50);
  var nightTotal      = Math.round(secondsInADay * 0.42);
  var transitionTotal = Math.round(secondsInADay * 0.04); // two of these

  var dayEnd     = dayTotal;
  var sunsetEnd  = dayEnd    + transitionTotal;
  var nightEnd   = sunsetEnd + nightTotal;
  var sunriseEnd = nightEnd  + transitionTotal;

  var nightAlpha = 0.90;

  var alpha = nightAlpha;

  var darkThreshold = 0.4;
  var dark = false;

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

      if (dark && alpha < darkThreshold) {
        dark = false;
        Sky.fireEvent('sunrise');
      }
    },
    day: function (time) {
      alpha = 0;
      dark = false;
    },
    sunset: function (time) {
      time = time - dayTotal;
      alpha = nightAlpha * transitionPercent(time);

      if (!dark && alpha < darkThreshold) {
        dark = true;
        Sky.fireEvent('sunset');
      }
    },
    night: function (time) {
      alpha = nightAlpha;
      dark = true;
    }
  };

  var run = function () {
    var time = GameTime.elapsedTime();
    time = time % secondsInADay;
    if (time < dayEnd) {
      states.day(time);
    } else if (time < sunsetEnd) {
      states.sunset(time);
    } else if (time < nightEnd) {
      states.night(time);
    } else {
      states.sunrise(time);
    }
  };

  var render = function () {
    if (alpha > 0 || this.dirty) {
      context.save();
      context.clearRect(0, 0, Game.GameWidth, Game.GameHeight);
      if (alpha > 0) {
        context.globalAlpha = alpha;
        context.fillRect(0, 0, Game.GameWidth, Game.GameHeight);
      }
      context.restore();
      this.dirty = false;
    }
  };

  var Sky = {
    context: context,
    preMove: run,
    render: render,
    currentAlpha: function () {
      return alpha;
    },
    isDark: function () {
      return dark;
    },
    visible: true,
    onScreen: true,
    dirty: false,
    z: 400
  };

  Game.events.subscribe('game start', function () {
    Sky.dirty = true;
    dark = false;
  });

  EventMachine(Sky);

  Game.addSprite(Sky);

  return Sky;
});
