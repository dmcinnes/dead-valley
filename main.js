require(
  ["game",
   "gridnode",
   "map",
   "mainloop",
   "sprite",
   "objects/Honda",
   "dude",
   "Sky",
   "framerate",
   "objects/Barrel"],

  function (game, GridNode, Map, mainloop, Sprite, Honda, Dude, Sky, framerate, Barrel) {

    // TODO clean this up so main isn't so cluttered
    require.ready(function () {

      var assetManager = game.assetManager;

      // want to start in the center of the right vertical road
      var startX = 50 + 96 * game.gridSize;
      var startY = 64 * game.gridSize;

      var createSprites = function () {

        game.sprites.push(Sky);

        var car = new Honda();

        car.pos.x = startX - 100;
        car.pos.y = startY - 200;
        car.pos.rot = 180;
        car.visible = true;
        game.sprites.push(car);

        var car2 = new Honda();

        car2.pos.x = startX - 50;
        car2.pos.y = startY;
        car2.pos.rot = 337;
        car2.visible = true;
        game.sprites.push(car2);

        var dude = new Dude({
          width: 20,
          height: 20,
          image: assetManager.images.dude
        });

        dude.pos.x = startX;
        dude.pos.y = startY;
        dude.visible = true;
        game.sprites.push(dude);
      };

      assetManager.registerCompleteLoadCallback(function () {

        game.tileRowSize = assetManager.images.tiles.width / game.gridSize;

        // assetManager.copyImageAndMutateWhite('car1', 'car1blue', 70, 70, 255);
        // only load the map after the assets are loaded
        game.map = new Map(128, 128, startX, startY, function () {

          createSprites();

          // only run the main loop after the map is loaded
          mainloop.play();
        });
      });

      _(['tiles', 'car1', 'dude', 'objects']).each(function (image) {
        assetManager.registerImage(image + '.png');
      });

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

      // transition sky states
      game.controls.registerKeyDownHandler('n', function () {
        Sky.gotoNextState();
      });

    });

});
