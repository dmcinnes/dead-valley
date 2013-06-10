// the Game loop

define(["Game"], function (Game) {

  var timestamp, lastFrame, thisFrame, elapsed, delta, paused, stopped;

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

  // support high resolution timer
  if (window.performance && window.performance.webkitNow) {
    timestamp = function () {
      return performance.webkitNow();
    };
  } else {
    timestamp = Date.now;
  }

  var profile = false;
  window.profileFrame = function () {
    profile = true;
  };

  var MainLoop = function () {
    if (stopped) {
      return;
    }

    thisFrame = timestamp();

    elapsed = thisFrame - lastFrame;
    if (elapsed > 100) {
      elapsed = 100; // cap it at 10 FPS
    }

    if (elapsed > 25) { // upper end at 40 FPS
      lastFrame = thisFrame;
      delta = elapsed / 1000;

      if (profile) {
        console.profile('frame');
      }

      Game.runGameState(delta);

      Game.runSprites(delta);
      Game.runObjects(delta);
      Game.runMap(delta);

      Game.renderSprites(delta);
      Game.renderMap(delta);

      Game.events.fireEvent('end frame');

      Game.cleanupFrame(delta);

      if (profile) {
        console.profileEnd();
        profile = false;
      }
    }

    if (!paused) {
      requestAnimFrame(MainLoop, GameField);
    }
  };

  var pause = function () {
    paused = true;
    Game.events.fireEvent('pause');
  };

  var play = function () {
    lastFrame = timestamp();
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

  Game.events.subscribe('game start', function () {
    Game.events.fireEvent('before start');
    // only run the main loop after everything has loaded
    play();
  });

  Game.events.subscribe('stop game', stop);
  Game.events.subscribe('start game', play);

  return {
    pause: pause,
    play: play,
    stop: stop,
    isPaused: function () {
      return paused;
    }
  };

});
