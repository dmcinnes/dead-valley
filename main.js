require(
  ["game",
   "gridnode",
   "map",
   "mainloop",
   "sprite",
   "car",
   "dude",
   "framerate"],

  function (game, GridNode, Map, mainloop, Sprite, Car, Dude, framerate) {

    // TODO clean this up so main isn't so cluttered
    require.ready(function () {

      var assetManager = game.assetManager;

      var createSprites = function () {
        var car = new Car('car',
                          24, 40,
                          assetManager.images.car1);

        car.pos.x = -100;
        car.pos.y = -200;
        car.pos.rot = 180;
        car.visible = true;
        game.sprites.push(car);

        var car2 = new Car('car',
                          24, 40,
                          assetManager.images.car1blue);

        car2.pos.x = 0;
        car2.pos.y = 0;
        car2.pos.rot = 337;
        car2.visible = true;
        game.sprites.push(car2);

        var dude = new Dude('dude',
                            20, 20,
                            assetManager.images.dude);
        dude.pos.x = 50;
        dude.pos.y = 0;
        dude.visible = true;
        game.sprites.push(dude);
      };

      assetManager.onComplete = function () {
        assetManager.copyImageAndMutateWhite('car1', 'car1blue', 70, 70, 255);
        // only load the map after the assets are loaded
        game.map = new Map(128, 128, function () {

          createSprites();

          // only run the main loop after the map is loaded
          mainloop.play();
        });
      };

      _(['tiles', 'car1', 'dude']).each(function (image) {
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

    });

});
