// World

define([], function () {

  // just gonna hold this here for now
  // TODO use storage
  var worldMap = {};

  var World = {
    setTiles: function (position, tiles) {
      console.log("Set ", position.toString());
      tiles.position = position;
      worldMap[position.toString()] = tiles;
    },

    getTiles: function (position) {
      console.log("Get ", position.toString(), worldMap[position.toString()] !== undefined);
      return worldMap[position.toString()];
    },

    getSurroundingRoads: function (position) {
      return _([worldMap[position.x   + ',' + position.y-1],
                worldMap[position.x+1 + ',' + position.y],
                worldMap[position.x   + ',' + position.y+1],
                worldMap[position.x-1 + ',' + position.y]]).map(function (t) {
                return t && t.roads;
              });
    }
  };

  return World;
});
