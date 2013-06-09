// a Web Worker for filling out the map
// 61.875 sections == 150 miles

if (!this.require) {
  var version = '';
  importScripts('../vendor/underscore-min.js',
                '../vendor/require.js');
}

require(['TileMarshal', 'section-list', 'car-list', 'inventory-list', 'Vector'], function (TileMarshal, section_list, car_list, inventory_list, Vector) {

  Vector.cache = false;

  MAX_ZOMBIES   = 30;

  GOAL_DISTANCE = 62; // ==~ 150 miles
  END_GAME      = 0.85; // last ~ten sections should be hellish


  var Tile = function () {};
  Tile.prototype.tileOffset = 0;
  TileMarshal(Tile);

  // so we can get output from the worker
  var console = {
    log: function () {
      var message = {
        type:    'log',
        message: _.toArray(arguments)
      };
      postMessage(message);
    }
  };

  // load 'meta map' section tiles
  var sections = {
  };

  postMessage({type:'progress', message:Object.keys(section_list).length});


  var carMap = [];

  // create a distribution array of all the cars so that we can
  // just pick a random element
  _.each(car_list, function (car, count) {
    for (var i = 0; i < count; i++) {
      carMap.push(car);
    }
  });


  // load the sections using AJAX
  var fetchMap = function (map, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', '../maps/'+map+'.json?cb='+version, false);
    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        callback(JSON.parse(req.responseText));
      }
    };
    req.send();
  };

  // sections set these variables with their data when loaded
  var map, roads, sprites, buildings;
  _(section_list).each(function (value, name) {

    fetchMap(name, function (map) {
      var mapData = map.map;
      var width   = Math.sqrt(mapData.length);
      var section = [];
      section.roadTileIndexes = [];

      // convert the map into objects
      for (var i = 0; i < mapData.length; i++) {
        var tile = new Tile();
        tile.setFromString(mapData[i]);
        section[i] = tile;
        tile.x = (i % width) * 60;
        tile.y = Math.floor(i / width) * 60;
        if (tile.isRoad) {
          section.roadTileIndexes.push(i);
        }
      }

      sections[name]    = section;

      // save the section metadata on the map Array object
      section.name      = name;
      section.frequency = value.freq;
      section.max       = value.max;
      section.count     = 0;

      // these are from the imported script
      section.roads     = map.roads     || [];
      section.sprites   = map.sprites   || [];
      section.buildings = map.buildings || [];

      postMessage({type:'progress'});
    });

  });

  // fills a map's blank tiles wth random dirt and scrub
  var seedShrubs = function (tiles, width) {
    var x, y, i, count;
    var total = tiles.length;
    var carCount = 0;

    if (!tiles.sprites) {
      tiles.sprites = [];
    }

    for (i = 0; i < total; i++) {
      var tile = tiles[i];
      if (tile.tileOffset === 0) {
        var test = Math.random();

        if (test > 0.9) {

          tile.tileOffset = Math.floor(Math.random()*2) + 1;
          tile.tileFlip = Math.random() > 0.5;
          tile.tileRotate = 0;

        } else if (test < 0.01) {

          x = (i % width) * 60;
          y = Math.floor(i / width) * 60;
          var tree = {
            clazz: 'Tree',
            type: 'Tree' + (Math.floor(Math.random() * 3) + 1),
            pos: {
              x: x + 30,
              y: y + 30,
              rot: Math.floor(Math.random() * 360)
            }
          };

          tiles.sprites.push(JSON.stringify(tree));
        }
      }
    }

  };

  var seedCars = function (tiles, scale) {
    var carCount = 0;

    if (scale > END_GAME ||           // always cars on endgame
        scale > 0 &&                  // never have cars on the first seciton
        Math.random() < 0.5) {        // 50% chance of cars

      carCount = Math.round(tiles.roadTileIndexes.length * 0.05);
      var roadTileIndexes = tiles.roadTileIndexes;

      if (roadTileIndexes.length === 0) {
        return;
      }

      for (var i = 0; i < carCount; i++) {
        var randomRoadTile = Math.round(Math.random() * (roadTileIndexes.length - 1));
        var tileIndex = roadTileIndexes[randomRoadTile];
        addCar(tiles[tileIndex], tiles, scale);
      }
    }

    return carCount;
  };

  var addCar = function (tile, tiles, scale) {
    var husk = Math.random() > 0.7;

    var pos = Vector.create(tile.x + Math.random() * 60,
                         tile.y + Math.random() * 60);

    var rot;
    if (tile.tileOffset === 3) { // road side
      // align with road
      rot = tile.tileRotate * 90;
      if (!tile.flip) {
        rot -= 180;
      }
      // give a little
      rot += 10 - Math.floor(Math.random() * 20);
    } else if (tile.tileOffset === 15 ||
               tile.tileOffset === 33) { // parking space
      // align
      rot = tile.tileRotate * 90;
      if (!tile.flip) {
        rot -= 180;
      }
      // give a little
      rot += 5 - Math.floor(Math.random() * 10);

      pos.set(tile.x + 30, tile.y + 30);
      var move = Vector.create(rot - 90);
      move.scale(30 + 10 * Math.random());
      if (tile.tileOffset === 33) {
        move.scale(-1);
      }
      pos.translate(move);
    } else {
      // random direction
      rot = Math.floor(Math.random() * 360);
    }

    var carType = carMap[Math.round(Math.random() * (carMap.length - 1))];
    var carColor = carType.colors[Math.round(Math.random() * (carType.colors.length - 1))];

    // 25% chance it has some fuel
    var fuel = Math.random() < 0.25 ? Math.random() * 0.5 : 0;

    var car = {
      clazz: carType.name,
      setColor: carColor,
      pos: {
        x: pos.x,
        y: pos.y,
        rot: rot
      },
      health: Math.round(Math.random() * carType.maxHealth),
      isCar: true,
      setFuelPercentage: fuel,
      zombies: (Math.random() < scale/5) ? 1 : 0,
      canSmoke: false // don't smoke until hit
    };

    if (husk) {
      car.makeHusk = true;
    }

    tiles.sprites.push(JSON.stringify(car));
  };

  var generateCount = function (countString) {
    var split = countString.split('d');
    var i, count = 0;
    if (split.length > 1) {
      var dice = parseInt(split[0], 10);
      var faces = parseInt(split[1], 10);
      for (i = 0; i < dice; i++) {
        count += Math.floor(Math.random() * faces) + 1;
      }
    } else {
      count = parseInt(countString, 10);
    }
    return count;
  };

  var newObject = function (proto) {
    var newItem = _.clone(proto);
    delete newItem.dice;
    _.each(newItem, function (value, key) {
      if (value.match && value.match(/^\dd\d$/)) {
        newItem[key] = generateCount(value);
      }
    });
    return newItem;
  };

  var seedBuildings = function (buildings, scale) {
    var zombieChance = scale / 5;
    return _.map(buildings, function (building) {
      building = _.clone(building);

      var list = building.inventory;
      var random, count, i, inventory = [];

      if (typeof(list) === 'string') {
        // load inventory from the pre-defined lists
        list = inventory_list[list] || {};
      }

      _.each(list, function (protoItem) {
        random = Math.random();
        if (random < protoItem.percent) {

          count = generateCount(protoItem.dice);

          if (protoItem.stacked) {
            var newItem = newObject(protoItem);
            newItem.count = count;
            inventory.push(newItem);
          } else {
            for (i = 0; i < count; i++) {
              inventory.push(newObject(protoItem));
            }
          }
        }
      });

      building.inventory = inventory;

      // zombies pop out!
      if (building.entrances.length &&
          Math.random() < zombieChance) {
        building.zombies = Math.round(scale * 2) + 1;
      }

      return building;
    });
  };

  var seedZombies = function (tiles, carCount, width, scale) {
    var i, j, tileOffset, tile, zombie, count, groupsLength;
    var roadTileIndexes     = tiles.roadTileIndexes;
    var buildingCount = tiles.buildings.length;
    var maxZombies    = 5 + buildingCount / 2 + carCount / 2;
    var zombieCount   = Math.round(maxZombies * scale) + 1;
    var zombieGroups  = [];

    // no added zombies on the first section
    if (scale === 0) {
      return;
    }

    if (zombieCount > MAX_ZOMBIES) {
      zombieCount = MAX_ZOMBIES;
    }

    // group the zombies up
    while (zombieCount) {
      count = Math.round(Math.random() * 10);
      if (count > zombieCount) {
        count = zombieCount;
      }
      zombieCount -= count;
      zombieGroups.push(count);
    }

    groupsLength = zombieGroups.length;

    for (i = 0; i < groupsLength; i++) {
      if (roadTileIndexes.length) {
        tileOffset = Math.round(Math.random() * (roadTileIndexes.length - 1));
        tile = tiles[roadTileIndexes[tileOffset]];
      } else {
        tileOffset = Math.round(Math.random() * (tiles.length - 1));
        tile = tiles[tileOffset];
      }

      // add the number of zombies that are in this group
      count = zombieGroups[i];
      for (j = 0; j < count; j++) {

        zombie = {
          clazz: 'Zombie',
          pos: {
            x: tile.x + Math.round(Math.random() * 60),
            y: tile.y + Math.round(Math.random() * 60),
            rot: 0
          }
        };

        tiles.sprites.push(JSON.stringify(zombie));
      }
    }
  };

  var loadSection = function (config) {
    return cloneSection(sections[config.sectionName]);
  };

  var cloneSection = function (section) {
    var tiles = [];
    for (var i = 0; i < section.length; i++) {
      tiles[i] = _.clone(section[i]);
    }
    tiles.roads     = _.clone(section.roads);
    tiles.sprites   = _.clone(section.sprites);
    tiles.buildings = _.clone(section.buildings);

    tiles.roadTileIndexes = section.roadTileIndexes;

    return tiles;
  };

  var getRandomSection = function (incomingRoads) {
    var canidates = [];

    for (var name in sections) {

      // no start section should ever appear again
      if (name.match(/start/)) {
        continue;
      }

      var section = sections[name];

      if (sections.hasOwnProperty(name) &&
          (!section.max || section.count < section.max)) {

        var match = true;
        for (var dir in section.roads) {
          if (incomingRoads.hasOwnProperty(dir) &&
              (incomingRoads[dir] !== null) &&
              (incomingRoads[dir] !== undefined) &&
              (incomingRoads[dir] !== section.roads[dir])) {
            match = false;
            break;
          }
        }

        if (match) {
          // add to canidate array according to frequency
          var count = Math.round(section.frequency * 10);
          for (var i = 0; i < count; i++) {
            canidates.push(section);
          }
        }
      }
    }

    var choice = (canidates.length) ?
      canidates[Math.round(Math.random() * (canidates.length - 1))] :
      sections.blank; // nothing is better than really nothing

    choice.count++;

    console.log(choice.name);
    return cloneSection(choice);
  };

  var resetSectionCounts = function () {
    for (var name in sections) {
      if (sections.hasOwnProperty(name)) {
        sections[name].count = 0;
      }
    }
  };

  onmessage = function (e) {
    var config = e.data;

    if (config === 'clear counts') {
      resetSectionCounts();
      return;
    }

    var x = config.position.x;
    var y = config.position.y;
    var distance = Math.sqrt(x*x + y*y);
    // how much to scale the zombie infestation
    var scale = distance / GOAL_DISTANCE;

    var tiles = (config.sectionName) ?
                  loadSection(config) :
                  getRandomSection(config.roads);

    seedShrubs(tiles, config.width);

    var carCount = seedCars(tiles, scale);

    seedZombies(tiles, carCount, config.width, scale);

    tiles.buildings = seedBuildings(tiles.buildings, scale);

    var length = tiles.length;
    var tilesString = "";
    for (var i = 0; i < length; i++) {
      tilesString += tiles[i].toString();
    }

    var message = {
      type:      'newtiles',
      tiles:     tilesString,
      roads:     tiles.roads,
      sprites:   tiles.sprites,
      buildings: tiles.buildings,
      position:  config.position
    };

    postMessage(message);
  };

});
