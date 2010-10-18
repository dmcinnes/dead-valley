// the game loop

define(["game"], function (game) {

  var lastFrame = Date.now();
  var thisFrame;
  var elapsed;
  var delta;

  var context = game.spriteContext;

  var mainLoop = function () {
    context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);

    thisFrame = Date.now();
    elapsed = thisFrame - lastFrame;
    lastFrame = thisFrame;
    delta = elapsed / 1000;

    game.runLevel(delta);
    game.runSprites(delta);
  };

  var mainLoopId = null;

  return {
    pause: function () {
      clearInterval(mainLoopId);
      mainLoopId = null;
    },
    play: function () {
      lastFrame = Date.now();
      mainLoopId = setInterval(mainLoop, 25);
    },
    isPaused: function () {
      return !mainLoopId;
    }
  };

});
