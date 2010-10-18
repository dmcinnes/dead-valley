// the game loop

define(["game"], function (game) {

  var i, j = 0;
  var showFramerate = true;
  var avgFramerate = 0;
  var frameCount = 0;
  var elapsedCounter = 0;

  var lastFrame = Date.now();
  var thisFrame;
  var elapsed;
  var delta;

  var context = game.spriteContext;
  var assetManager = game.assetManager;

  var mainLoop = function () {
    context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);

    if (assetManager.loadedCount < assetManager.totalCount) {
      context.save();
      context.fillStyle = 'red';
      context.beginPath();
      context.moveTo(100, 100);
      context.lineTo(game.canvasWidth - 100, 100);
      context.lineTo(game.canvasWidth - 100, 120);
      context.lineTo(100, 120);
      context.closePath();
      context.stroke();
      context.fillRect(100, 100, (game.canvasWidth - 200) * assetManager.loadedCount / assetManager.totalCount, 20);
      context.restore();
    }

    thisFrame = Date.now();
    elapsed = thisFrame - lastFrame;
    lastFrame = thisFrame;
    delta = elapsed / 30;

    game.runLevel(delta);
    game.runSprites(delta);

    if (showFramerate) {
      context.save();
      context.fillStyle = 'green';
      context.fillText(''+avgFramerate, game.canvasWidth - 38, game.canvasHeight - 2);
      context.restore();
    }

    frameCount++;
    elapsedCounter += elapsed;
    if (elapsedCounter > 1000) {
      elapsedCounter -= 1000;
      avgFramerate = frameCount;
      frameCount = 0;
    }
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
