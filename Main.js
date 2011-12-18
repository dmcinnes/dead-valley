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
            World,
            Mouse,
            Cheat) {

    // TODO clean this up so main isn't so cluttered
    require.ready(function () {
      var dude, startX, startY;
      var startPos = Game.startPosition;

      Game.addSprite(Sky);

      var dudeState = World.getDude();

      if (dudeState) {
        var parsedDudeState = JSON.parse(dudeState);
        dude = Dude.marshal(dudeState);
        startPos = parsedDudeState.pos;

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
        // add our starting players
        dude = new Dude();
        dude.pos.set(startPos);
      }

      // Call me The DUDE
      Game.newDude(dude);

      // set up the map
      Game.map = new Map(128, 128, startPos.x, startPos.y);

      if (!dudeState) {

        Game.map.loadStartMapTiles('EW_burbs');
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
