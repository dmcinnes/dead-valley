// World

define([], function () {

  // save the bits in localStorage
  var worldMap = localStorage;

  var World = {
    setTiles: function (position, tiles) {
      // console.log("Set ", position.toString());
      tiles.position = position;
      worldMap[position.toString()] = JSON.stringify(tiles);
    },

    getTiles: function (position) {
      var data = worldMap[position.toString()];
      // console.log("Get ", position.toString(), data !== undefined);
      return data && JSON.parse(data);
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
