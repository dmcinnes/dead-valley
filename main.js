require(
  ["underscore-min",
   "game",
   "gridnode",
   "level",
   "mainloop"],
   
  function(_, game, GridNode, Level, mainloop) {

    require.ready(function() {

      mainloop.play();

      var assetManager = game.assetManager;
      assetManager.onComplete = function () {
        // only load the level after the assets are loaded
        game.currentLevel = new Level(100, 100);
      };

      // TODO make the link between GridNodes and tile images cleaner
      GridNode.prototype.tiles = assetManager.registerImage('./tiles.png');
      assetManager.loadAssets();


      // toggle show framerate
      game.controls.registerKeyDownHandler('f', function () {
        showFramerate = !showFramerate;
      });

      // toggle pause
      game.controls.registerKeyDownHandler('p', function () {
        if (mainloop.isPaused()) {
          mainloop.play();
        } else {
          mainloop.pause();
          // TODO do something nicer with this, make it a sprite or something
          game.spriteContext.save();
          game.spriteContext.fillStyle = 'green';
          game.spriteContext.fillText('PAUSED', 100, 100);
          game.spriteContext.restore();
        }
      });

    });

});
