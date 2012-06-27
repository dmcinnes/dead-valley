// World

define(["Console"], function (Console) {

  // save the bits in localStorage
  var worldMap = localStorage;

  var saveList = worldMap.saveList;
  saveList = saveList ? JSON.parse(saveList) : [];

  var makeSomeRoom = function () {
    var key = saveList.shift();
    Console.log('deleting ' + key);
    delete worldMap[key];
  };

  var updateSaveList = function (key) {
    if (key !== 'dude') {
      saveList.push(key);
      save('saveList', saveList);
    }
  };

  var save = function (key, data, noStringify) {
    var stringData = noStringify ? data : JSON.stringify(data);
    var tryAgain = false;
    do {
      try {
        worldMap[key] = stringData;
        if (key !== 'saveList') { // no super recursion
          updateSaveList(key);
        }
        tryAgain = false;
      } catch (e) {
        makeSomeRoom();
        tryAgain = true;
      }
    } while (tryAgain);
  };

  var World = {
    setSectionData: function (position, data) {
      var pos = position.toString();
      save(pos, data.tiles, true);
      if (data.roads) {
        save(pos + 'r', data.roads);
      }
      if (data.buildings) {
        save(pos + 'b', data.buildings);
      }
      if (data.sprites) {
        this.saveSprites(position, data.sprites);
      }
    },

    saveSprites: function (position, sprites) {
      save(position.toString() + 's', sprites);
    },

    saveDude: function (dude) {
      if (dude) {
        save('dude', dude.toString(), true);
      }
    },

    saveBuildings: function (position, buildings) {
      save(position.toString() + 'b', buildings);
    },

    saveTime: function (time) {
      save('time', time);
    },

    getTime: function () {
      var time = worldMap.time;
      return time && parseInt(time, 10);
    },

    saveTimeLimit: function (limit) {
      if (limit) {
        save('limit', limit);
      } else {
        delete worldMap.limit;
      }
    },

    saveStats: function (stats) {
      if (stats) {
	save('stats', stats);
      }
    },

    getTimeLimit: function () {
      var limit = worldMap.limit;
      return limit && parseInt(limit, 10);
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
      return worldMap.dude;
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

    getStats: function () {
      var data = worldMap.stats;
      return data && JSON.parse(data);
    },

    usedSpace: function () {
      var count = 0;
      for (var i = 0; i < localStorage.length; i++) {
        count += localStorage[localStorage.key(i)].length;
      }
      return count * 2; // 2 bytes per character
    },

    clear: function () {
      worldMap.clear();
    }
  };

  return World;
});
