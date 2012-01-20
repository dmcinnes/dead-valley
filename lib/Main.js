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
   "GameTime",
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
            GameTime,
            Mouse,
            Cheat) {

  // TODO clean this up so main isn't so cluttered
  var dude, startX, startY;

  Game.addSprite(Sky);

  var dudeState = World.getDude();

  Game.map = new Map(128, 128);

  if (dudeState) {
    var parsedDudeState = JSON.parse(dudeState);
    dude = Dude.marshal(dudeState);
    var startPos = parsedDudeState.pos;

    // set up the map
    Game.map.setStartPosition(startPos.x, startPos.y);

    // wait until the map has loaded
    // other sprites are loaded with the map
    Game.events.subscribe('before start', function () {
      if (dude.driving) {
        var car = _.detect(Game.sprites, function (sprite) {
          return sprite.isCar && sprite.pos.equals(dude.pos);
        });
        if (car) {
          dude.enterCar(car);
        } else {
          dude.driving = false;
        }
      }
      if (dude.inside) {
        dude.updateGrid(); // otherwise currentNode is null
        if (dude.currentNode.entrance) {
          dude.enterBuilding(dude.currentNode.entrance);
        } else {
          dude.inside = false;
        }
      }
    });

    GameTime.setTime(World.getTime());

    // Call me The DUDE
    Game.newDude(dude);

    Game.map.loadStartMapTiles();

  } else {
    Game.newGame();
  }

  // save the sprites before we leave
  $(window).unload(function () {
    // don't save if the world has been cleared
    // -- cleared the world for a reason
    if (World.usedSpace()) {
      World.saveDude(Game.dude);
      World.saveTime(GameTime.elapsedTime());
      Game.map.save();
    }
  });

});
