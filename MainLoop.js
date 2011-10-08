// the Game loop

define(["Game"], function (Game) {

  var lastFrame, thisFrame, elapsed, delta, paused;

  var GameField = $('#canvas-mask')[0];

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

  var MainLoop = function (thisFrame) {
    thisFrame = thisFrame || Date.now();
    elapsed = thisFrame - lastFrame;
    if (elapsed > 100) {
      elapsed = 100; // cap it at 10 FPS
    }
    lastFrame = thisFrame;
    delta = elapsed / 1000;

    Game.runSprites(delta);
    Game.runObjects(delta);
    Game.runMap(delta);

    Game.renderSprites(delta);
    Game.renderMap(delta);

    if (!paused) {
      requestAnimFrame(MainLoop, GameField);
    }
  };

  var pause = function () {
    paused = true;
    Game.events.fireEvent('pause');
  };

  var play = function () {
    lastFrame = Date.now();
    paused = false;
    MainLoop();
    Game.events.fireEvent('play');
  };

  Game.events.subscribe('toggle pause', function () {
    if (paused) {
      play();
    } else {
      pause();
    }
  });

  Game.events.subscribe('map loaded', function () {
    Game.events.fireEvent('before start');
    // only run the main loop after the map is loaded
    play();
  });

  return {
    pause: pause,
    play: play,
    isPaused: function () {
      return paused;
    }
  };

});
