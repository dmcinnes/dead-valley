// the game loop

define(["game"], function (game) {

  var lastFrame, thisFrame, elapsed, delta, paused;

  var context = game.spriteContext;

  var gameField = $('#canvas-mask')[0];

  // shim layer with setTimeout fallback
  // from here:
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (/* function */ callback, /* DOMElement */ element) {
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var mainLoop = function () {
    context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);

    thisFrame = Date.now();
    elapsed = thisFrame - lastFrame;
    lastFrame = thisFrame;
    delta = elapsed / 1000;

    game.runSprites(delta);
    game.runMap(delta);

    game.renderSprites(delta);
    game.renderMap(delta);

    if (paused) {
    } else {
      requestAnimFrame(mainLoop, gameField);
    }
  };

  return {
    pause: function () {
      paused = true;
    },
    play: function () {
      lastFrame = Date.now();
      paused = false;
      mainLoop();
    },
    isPaused: function () {
      return paused;
    }
  };

});
