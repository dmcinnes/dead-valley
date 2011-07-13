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
      if (data.buildings) {
        worldMap[pos + 'b'] = JSON.stringify(data.buildings);
      }
      if (data.sprites) {
        this.saveSprites(position, data.sprites);
      }
    },

    saveSprites: function (position, sprites) {
      worldMap[position.toString() + 's'] = JSON.stringify(sprites);
    },

    saveDude: function (dude) {
      worldMap['dude'] = dude.toString();
    },

    saveBuildings: function (position, buildings) {
      worldMap[position.toString() + 'b'] = JSON.stringify(buildings);
    },

    getTiles: function (position) {
      var data = worldMap[position.toString()];
      return data;
    },

    getRoads: function (position) {
      var data = worldMap[position.toString() + 'r'];
      return data && JSON.parse(data);
    },

    getBuildings: function (position) {
      var data = worldMap[position.toString() + 'b'];
      return data && JSON.parse(data);
    },

    getSprites: function (position) {
      var data = worldMap[position.toString() + 's'];
      return data && JSON.parse(data);
    },

    getDude: function () {
      return worldMap['dude'];
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
    },

    usedSpace: function () {
      var count = 0;
      for (var i = 0; i < localStorage.length; i++) {
        count += localStorage[localStorage.key(i)].length
      }
      return count * 2; // 2 bytes per character
    }
  };

  return World;
});
