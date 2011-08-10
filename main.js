require(
  ["game",
   "Controls",
   "gridnode",
   "map",
   "mainloop",
   "sprite",
   "dude",
   "Sky",
   "hud/Hud",
   "sprites/Honda",
   "sprites/Zombie",
   "sprites/Barrel",
   "inventory/Glock19",
   "inventory/AK_47",
   "inventory/Shotgun",
   "inventory/ShotgunShells",
   "inventory/Nine_mm",
   "inventory/Flashlight",
   "inventory/BaseballBat",
   "World",
   "Mouse",
   "Cheat"],

  function (game,
            Controls,
            GridNode,
            Map,
            mainloop,
            Sprite,
            Dude,
            Sky,
            Hud,
            Honda,
            Zombie,
            Barrel,
            Glock19,
            AK_47,
            Shotgun,
            ShotgunShells,
            Nine_mm,
            Flashlight,
            BaseballBat,
            World,
            Mouse,
            Cheat) {

    // TODO clean this up so main isn't so cluttered
    require.ready(function () {
      var dude, startX, startY;

      game.addSprite(Sky);

      var dudeState = World.getDude();

      if (dudeState) {
        var parsedDudeState = JSON.parse(dudeState);
        dude = Dude.marshal(dudeState);
        startX = parsedDudeState.pos.x;
        startY = parsedDudeState.pos.y;

        // wait until the map has loaded
        // other sprites are loaded with the map
        game.events.subscribe('before start', function () {
          if (dude.driving) {
            var car = _.detect(game.sprites, function (sprite) {
              return sprite.isCar && sprite.pos.equals(dude.pos);
            });
            if (car) {
              dude.enterCar(car);
            }
          }
          if (dude.inside) {
            dude.updateGrid(); // otherwise currentNode is null
            if (dude.currentNode.entrance) {
              dude.enterBuilding(dude.currentNode.entrance);
            }
          }
        });

      } else {
        // want to start in the center of the right vertical road
        startX = 40 * game.gridSize;
        startY = 26 * game.gridSize;

        // add our starting players
        dude = new Dude();
        dude.pos.x = startX;
        dude.pos.y = startY;

        // give the dude a pistol!
        dude.inventory.addItem(new Glock19(), 1, 1);
        // and why not, an AK and a flashlight
        dude.inventory.addItem(new AK_47(), 5, 0);
        dude.inventory.addItem(new Flashlight(), 0, 0);
        // shotty
        dude.inventory.addItem(new Shotgun(), 7, 0);
        dude.inventory.addItem(new ShotgunShells(12), 2, 0);
        dude.inventory.addItem(new ShotgunShells(12), 2, 1);
        dude.inventory.addItem(new Nine_mm(36), 3, 2);
        dude.inventory.addItem(new BaseballBat(), 4, 0);

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

      // Call me The DUDE
      game.newDude(dude);

      // set up the map
      game.map = new Map(128, 128, startX, startY, function () {
        game.events.fireEvent('map loaded');
      });

      if (!dudeState) {
        game.map.loadStartMapTiles('gas-station-crossroads', 'intersection', 'intersection', 'intersection');
      } else {
        game.map.loadStartMapTiles();
      }

      // save the sprites before we leave
      $(window).unload(function () {
        // don't save if the world has been cleared
        // -- cleared the world for a reason
        if (World.usedSpace()) {
          World.saveDude(game.dude);
          game.map.save();
        }
      });
    });

});
