require(
  ["underscore-min",
   "game",
   "gridnode",
   "level",
   "mainloop",
   "framerate"],
   
  function(_, game, GridNode, Level, mainloop, framerate) {

    require.ready(function() {

      mainloop.play();

      var assetManager = game.assetManager;
      assetManager.onComplete = function () {
        // only load the level after the assets are loaded
        game.currentLevel = new Level(128, 64);
      };

      // TODO make the link between GridNodes and tile images cleaner
      GridNode.prototype.tiles = assetManager.registerImage('./tiles.png');
      assetManager.loadAssets();

      game.sprites.push(framerate);

      // toggle show framerate
      game.controls.registerKeyDownHandler('f', function () {
        if (framerate.isShowing()) {
          framerate.hide();
        } else {
          framerate.show();
        }
      });

      var parseNode = $('#pause');
      // toggle pause
      game.controls.registerKeyDownHandler('p', function () {
        if (mainloop.isPaused()) {
          mainloop.play();
          parseNode.removeClass('active');
        } else {
          mainloop.pause();
          parseNode.addClass('active');
        }
      });

    });

});
