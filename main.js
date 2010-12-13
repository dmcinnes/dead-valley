require(
  ["underscore-min",
   "game",
   "gridnode",
   "map",
   "mainloop",
   "sprite",
   "car",
   "dude",
   "framerate"],
   
  function (_, game, GridNode, Map, mainloop, Sprite, Car, Dude, framerate) {

    require.ready(function () {

      mainloop.play();

      var assetManager = game.assetManager;
      assetManager.onComplete = function () {
        // only load the map after the assets are loaded
        game.map = new Map(128, 64);
      };

      // TODO make the link between GridNodes and tile images cleaner
      GridNode.prototype.tiles = assetManager.registerImage('./assets/tiles.png');
      // TODO make images addressible in assetManager
      var carImage  = assetManager.registerImage('./assets/car1.png');
      var dudeImage = assetManager.registerImage('./assets/dude.png');

      assetManager.loadAssets();

      game.sprites.push(framerate);

      var car = new Car('car',
                        24, 40,
                        carImage);

      car.pos.x = 0;
      car.pos.y = 0;
      car.pos.rot = 90;
      car.visible = true;
      game.sprites.push(car);

      var car2 = new Car('car',
                        24, 40,
                        carImage);

      car2.pos.x = 0;
      car2.pos.y = 200;
      car2.visible = true;
      game.sprites.push(car2);

      // var car3 = new Car('car',
      //                   24, 40,
      //                   carImage);

      // car3.pos.x = 0;
      // car3.pos.y = 400;
      // car3.visible = true;
      // game.sprites.push(car3);

      var dude = new Dude('dude',
                          20, 20,
                          dudeImage);
      dude.pos.x = 50;
      dude.pos.y = 0;
      dude.visible = true;
      game.sprites.push(dude);

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
