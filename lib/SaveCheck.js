define(['Game', 'World'], function (Game, World) {

  var check = function () {
    var dudeState = JSON.parse(World.getDude());

    console.log('Dude', !!dudeState);

    // only so it can handle the section calculation
    Game.map.setPosition(dudeState.pos.x, dudeState.pos.y);

    _.each(['nw', 'ne', 'sw', 'se'], function (dir) {
      var coords = Game.map.getSectionCoords(dir);

      var tiles     = !!World.getTiles(coords);
      var roads     = !!World.getRoads(coords);
      var buildings = !!World.getBuildings(coords);
      var sprites   = !!World.getSprites(coords);
      var sRoads    = !!World.getSurroundingRoads(coords);

      console.log(dir, tiles, roads, buildings, sprites, sRoads);
    });

    console.log('Time Limit', !!World.getTimeLimit());
    console.log('Stats', !!World.getStats());
  };

  window.check = check;

  return {
    check: check
  };

});
