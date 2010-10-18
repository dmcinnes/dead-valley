require(
  ["underscore-min",
   "controls",
   "game",
   "gridnode",
   "level",
   "matrix",
   "sprite"],
   
  function(_, controls, game, GridNode, Level, Matrix, Sprite) {

    require.ready(function() {
      Level.prototype.context = game.spriteContext;
      GridNode.prototype.context = game.spriteContext;
      GridNode.prototype.background = $('#background');

      // so all the sprites can use it
      Sprite.prototype.context = game.spriteContext;
      Sprite.prototype.matrix  = new Matrix(2, 3);

      var assetManager = game.assetManager;
      assetManager.onComplete = function () {
        // only load the level after the assets are loaded
        game.currentLevel = new Level(100, 100);
      };

      GridNode.prototype.tiles = assetManager.registerImage('./tiles.png');
      assetManager.loadAssets();

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

      var mainLoopId = setInterval(mainLoop, 25);

      // toggle show framerate
      controls.registerKeyDownHandler('f', function () {
        showFramerate = !showFramerate;
      });

      // toggle pause
      controls.registerKeyDownHandler('p', function () {
        if (mainLoopId) {
          clearInterval(mainLoopId);
          mainLoopId = null;
          context.save();
          context.fillStyle = 'green';
          context.fillText('PAUSED', 100, 100);
          context.restore();
        } else {
          lastFrame = Date.now();
          mainLoopId = setInterval(mainLoop, 25);
        }
      });

    });

});


$(function () {
});

// vim: fdl=0
