// a Web Worker for filling out the map

// Existing tiles:
// TODO move these into a constants file
//
// 0 blank
// 1 dirt
// 2 scrub
// 3 road edge
// 4 asphalt
// 5 road double yellow lines
// 6 road dashed and solid yellow lines
// 7 building corner (lower left)
// 8 building side (bottom)

// our 'meta' map tiles are 128 level tiles wide and 64 tall
// they are added to the map either horizontally or vertically
//
// So what do we have
//
// horizontal road
// vertical road
// crossroads
// curve left
// curve right

// so we can use tileMarshal even though it's defined
// with requirejs
var tileMarshal;
var define = function (r) {
  tileMarshal = r();
};

importScripts('json2.js',
              'tilemarshal.js',
              'underscore-min.js');

var Tile = function () {};
Tile.prototype.tileOffset = 0;
tileMarshal(Tile);

// so we can get output from the worker
var console = {
  log: function () {
    var message = {
      type:    'log',
      message: _(arguments).toArray()
    };
    postMessage(JSON.stringify(message));
  }
};

// load 'meta map' section tiles
var sections = {
};

// sections set these variables with their data when loaded
var map, roads;
// TODO somehow pull the section names from somewhere
_(['blank', 'NS_road', 'intersection']).each(function (name) {
  importScripts('maps/'+name+'.json');
  sections[name] = map;
  // save the road directions on the map Array object
  map.roads = roads;
  map.name  = name;

  // convert the map into objects
  for (var i = 0; i < map.length; i++) {
    var tile = new Tile();
    tile.setFromString(map[i]);
    map[i] = tile;
  }
});

// fills a map's blank tiles wth random dirt and scrub
var fillBlankTiles = function (tiles) {
  var total = tiles.length;

  for (var i = 0; i < total; i++) {
    var tile = tiles[i];
    if (tile.tileOffset == 0 && Math.random() > 0.9) {
      tile.tileOffset = Math.floor(Math.random()*2) + 1;
      tile.tileFlip = Math.random() > 0.5;
      tile.tileRotate = 0; // Math.floor(Math.random() * 4);
    }
  }

  return tiles;
};

var loadSection = function (config) {
  // fills the map with the given section
  var section = sections[config.sectionName];
  var sectionLength = section.length;
  var mapLength = config.width * config.height;
  var tiles = [];
  for (var i = 0; i < mapLength; i++) {
    tiles[i] = _.clone(section[i % sectionLength]);
  }
  tiles.roads = section.roads;
  return tiles;
};

var cloneSection = function (section) {
  var tiles = [];
  for (var i = 0; i < section.length; i++) {
    tiles[i] = _.clone(section[i]);
  }
  tiles.roads = section.roads;
  return tiles;
};

var getRandomSection = function (incomingRoads) {
  var canidates = [];

  for (var name in sections) {
    if (sections.hasOwnProperty(name)) {
      var section = sections[name];

      var match = true;
      for (var dir in section.roads) {
        if (incomingRoads.hasOwnProperty(dir) &&
            (incomingRoads[dir] !== undefined) &&
            (incomingRoads[dir] !== section.roads[dir])) {
          match = false;
          break;
        }
      }

      if (match) {
        canidates.push(section);
      }
    }
  }

  var choice = (canidates.length) ?
    canidates[Math.floor(Math.random() * canidates.length)] :
    sections['blank']; // nothing is better than really nothing

  console.log(choice.name);
  return cloneSection(choice);
};

onmessage = function (e) {
  var config = JSON.parse(e.data);

  var tiles = (config.sectionName) ?
                loadSection(config) :
                getRandomSection(config.roads);

  fillBlankTiles(tiles);

  var message = {
    type:     'newtiles',
    tiles:    _(tiles).map(function (t) { return t.toString(); }),
    roads:    tiles.roads,
    position: config.position
  };

  postMessage(JSON.stringify(message));
};
