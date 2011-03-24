// The Sky

define(["game", "sprite"], function (game, Sprite) {

  var context = game.skyContext;

  // in seconds
  var dayTotal        = 10 * 60;
  var nightTotal      =  7 * 60;
  var transitionTotal = 90;

  var counter = 45; // 1/2 the way through sunrise

  var nightAlpha = 0.95;

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

  var currentState = states.sunrise;

  var Sky = {
    run: function (delta) {
      counter -= delta;
      currentState();
    },
    render: function (delta) {
      context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
      context.fillStyle = "rgba(0, 0, 50, "+alpha+")";
      context.fillRect(0, 0, game.canvasWidth, game.canvasHeight);
      // context.globalCompositeOperation = 'source-out';
      // context.beginPath();
      // context.moveTo(450, 300);
      // context.lineTo(420, 200);
      // context.lineTo(480, 200);
      // context.closePath();
      // context.fill();
      // context.globalCompositeOperation = 'source-over';
    },
    currentAlpha: function () {
      return alpha;
    },
    gotoNextState: function () {
      counter = -1;
      currentState();
    }
  };
  
  return Sky;
});
