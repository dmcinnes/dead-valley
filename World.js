// World

define([], function () {

  // save the bits in localStorage
  var worldMap = localStorage;

  var World = {
    setTiles: function (position, tiles) {
      // console.log("Set ", position.toString());
      tiles.position = position;
      worldMap[position.toString()] = JSON.stringify(tiles);
      if (tiles.roads) {
        worldMap[position.toString() + 'r'] = JSON.stringify(tiles.roads);
      }
    },

    getTiles: function (position) {
      var data = worldMap[position.toString()];
      // console.log("Get ", position.toString(), data !== undefined);
      return data && JSON.parse(data);
    },

    getRoads: function (position) {
      var data = worldMap[position.toString() + 'r'];
      return data && JSON.parse(data);
    },

    getSurroundingRoads: function (position) {
      var northSection = this.getRoads(position.add({x: 0, y:-1})),
          southSection = this.getRoads(position.add({x: 0, y: 1})),
          eastSection  = this.getRoads(position.add({x: 1, y: 0})),
          westSection  = this.getRoads(position.add({x:-1, y: 0}));
      return {
        n: northSection && northSection.s,
        s: southSection && southSection.n,
        e: eastSection  && eastSection.w,
        w: westSection  && westSection.e
      };
    }
  };

  return World;
});
