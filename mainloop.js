// the game loop

define(["game"], function (game) {

  var lastFrame, thisFrame, elapsed, delta, mainLoopId;

  var context = game.spriteContext;

  var mainLoop = function () {
    context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);

    thisFrame = Date.now();
    elapsed = thisFrame - lastFrame;
    lastFrame = thisFrame;
    delta = elapsed / 1000;

    game.runMap(delta);
    game.runSprites(delta);
  };

  return {
    pause: function () {
      clearInterval(mainLoopId);
      mainLoopId = null;
    },
    play: function () {
      lastFrame = Date.now();
      mainLoopId = setInterval(mainLoop, 50);
    },
    isPaused: function () {
      return !mainLoopId;
    }
  };

});
