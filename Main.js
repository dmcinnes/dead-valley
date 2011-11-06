require(
  ["Game",
   "Controls",
   "GridNode",
   "Map",
   "MainLoop",
   "Sprite",
   "Dude",
   "Sky",
   "hud/Hud",
   "sprites/Zombie",
   "World",
   "Mouse",
   "Cheat"],

  function (Game,
            Controls,
            GridNode,
            Map,
            MainLoop,
            Sprite,
            Dude,
            Sky,
            Hud,
            Zombie,
            World,
            Mouse,
            Cheat) {

    // TODO clean this up so main isn't so cluttered
    require.ready(function () {
      var dude, startX, startY;

      Game.addSprite(Sky);

      var dudeState = World.getDude();

      if (dudeState) {
        var parsedDudeState = JSON.parse(dudeState);
        dude = Dude.marshal(dudeState);
        startX = parsedDudeState.pos.x;
        startY = parsedDudeState.pos.y;

        // wait until the map has loaded
        // other sprites are loaded with the map
        Game.events.subscribe('before start', function () {
          if (dude.driving) {
            var car = _.detect(Game.sprites, function (sprite) {
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
        startX = 40 * Game.gridSize;
        startY = 26 * Game.gridSize;

        // add our starting players
        dude = new Dude();
        dude.pos.x = startX;
        dude.pos.y = startY;

        var zombie = new Zombie();
        zombie.pos.x = startX + 200;
        zombie.pos.y = startY;
        Game.addSprite(zombie);

        zombie = new Zombie();
        zombie.pos.x = startX + 200;
        zombie.pos.y = 1000;
        Game.addSprite(zombie);

        zombie = new Zombie();
        zombie.pos.x = startX + 300;
        zombie.pos.y = 1000;
        Game.addSprite(zombie);
      }

      // Call me The DUDE
      Game.newDude(dude);

      // set up the map
      Game.map = new Map(128, 128, startX, startY, function () {
        Game.events.fireEvent('map loaded');
      });

      if (!dudeState) {
        Game.map.loadStartMapTiles('gas-station-crossroads', 'burbs1', 'intersection', 'intersection');
      } else {
        Game.map.loadStartMapTiles();
      }

      // save the sprites before we leave
      $(window).unload(function () {
        // don't save if the world has been cleared
        // -- cleared the world for a reason
        if (World.usedSpace()) {
          World.saveDude(Game.dude);
          Game.map.save();
        }
      });
    });

});
