require(
  ["game",
   "gridnode",
   "map",
   "mainloop",
   "sprite",
   "dude",
   "Sky",
   "framerate",
   "sprites/Honda",
   "sprites/Zombie",
   "sprites/Barrel",
   "World",
   "spriteMarshal"],

  function (game,
            GridNode,
            Map,
            mainloop,
            Sprite,
            Dude,
            Sky,
            framerate,
            Honda,
            Zombie,
            Barrel,
            World,
            spriteMarshal) {

    // TODO clean this up so main isn't so cluttered
    require.ready(function () {
      var dude, startX, startY;

      game.addSprite(Sky);

      var dudeState = World.getDude();

      if (dudeState) {
        dude = Dude.marshal(dudeState);
        game.dude = dude;
        game.addSprite(dude);
        startX = dude.pos.x;
        startY = dude.pos.y;
      } else {
        // want to start in the center of the right vertical road
        startX = 40 * game.gridSize;
        startY = 26 * game.gridSize;

        // add our starting players
        dude = new Dude();
        dude.pos.x = startX;
        dude.pos.y = startY;
        game.dude = dude;
        game.addSprite(dude);

        var zombie = new Zombie();
        zombie.pos.x = startX + 200;
        zombie.pos.y = startY;
        game.addSprite(zombie);

        zombie = new Zombie();
        zombie.pos.x = startX + 200;
        zombie.pos.y = 1000;
        game.addSprite(zombie);

        zombie = new Zombie();
        zombie.pos.x = startX + 300;
        zombie.pos.y = 1000;
        game.addSprite(zombie);
      }

      game.addSprite(framerate);

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

      // set up the map
      game.map = new Map(128, 128, startX, startY, function () {
        // only run the main loop after the map is loaded
        mainloop.play();
      });

      if (!dudeState) {
        game.map.loadStartMapTiles('gas-station-crossroads', 'intersection', 'intersection', 'intersection');
      } else {
        game.map.loadStartMapTiles();
      }

      // save the sprites before we leave
      $(window).unload(function () {
        game.map.save();
        World.saveDude(game.dude);
      });

    });

});
