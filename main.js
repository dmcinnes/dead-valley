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

      // move center point back a bit so steering works right
      var car = new Car('car',
                        [-12, -30,
                          12, -30,
                          12, 12,
                         -12, 12],
                         carImage,
                         24,
                         40);

      car.x = 0;
      car.y = 0;
      car.rot = 90;
      car.visible = true;
      game.sprites.push(car);

      var car2 = $.extend({}, car);
      car2.y = 80;
      game.sprites.push(car2);

      var car3 = $.extend({}, car);
      car3.y = 160;
      car3.rot = 0;
      game.sprites.push(car3);

      var dude = new Dude('dude',
                          [-10, -10,
                            10, -10,
                            10, 10,
                           -10, 10],
                           dudeImage,
                           20,
                           20);
      dude.x = 50;
      dude.y = 0;
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
