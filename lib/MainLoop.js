// the Game loop

define(["Game"], function (Game) {

  var lastFrame, thisFrame, elapsed, delta, paused, stopped;

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
    if (stopped) {
      return;
    }

    thisFrame = thisFrame || Date.now();
    elapsed = thisFrame - lastFrame;
    if (elapsed > 100) {
      elapsed = 100; // cap it at 10 FPS
    }
    lastFrame = thisFrame;
    delta = elapsed / 1000;

    Game.runGameState(delta);

    Game.runSprites(delta);
    Game.runObjects(delta);
    Game.runMap(delta);

    Game.renderSprites(delta);
    Game.renderMap(delta);

    Game.events.fireEvent('end frame');

    Game.cleanupFrame(delta);

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
    stopped = false;
    MainLoop();
    Game.events.fireEvent('play');
  };

  var stop = function () {
    stopped = true;
  };

  Game.events.subscribe('toggle pause', function () {
    if (!Game.isOver) {
      if (paused) {
        play();
      } else {
        pause();
      }
    }
  });

  Game.events.subscribe('new game', function () {
    Game.events.fireEvent('before start');
    // only run the main loop after everything has loaded
    play();
  });

  Game.events.subscribe('stop game', stop);

  return {
    pause: pause,
    play: play,
    stop: stop,
    isPaused: function () {
      return paused;
    }
  };

});
