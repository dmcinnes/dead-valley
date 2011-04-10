// World

define([], function () {

  // save the bits in localStorage
  var worldMap = localStorage;

  var World = {
    setSectionData: function (position, data) {
      var pos = position.toString();
      worldMap[pos]       = data.tiles;
      if (data.roads) {
        worldMap[pos + 'r'] = JSON.stringify(data.roads);
      }
    },

    saveSprites: function (position, sprites) {
      worldMap[position.toString() + 's'] = JSON.stringify(sprites);
    },

    getTiles: function (position) {
      var data = worldMap[position.toString()];
      return data;
    },

    getRoads: function (position) {
      var data = worldMap[position.toString() + 'r'];
      return data && JSON.parse(data);
    },

    getSprites: function (position) {
      var data = worldMap[position.toString() + 's'];
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
