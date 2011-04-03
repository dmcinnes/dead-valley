// a Web Worker for filling out the map

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

// loads the section list into section_list
importScripts('section_list.js');

// sections set these variables with their data when loaded
var map, roads, sprites;
_(section_list).each(function (name) {
  importScripts('maps/'+name+'.json');

  var section = [];

  // convert the map into objects
  for (var i = 0; i < map.length; i++) {
    var tile = new Tile();
    tile.setFromString(map[i]);
    section[i] = tile;
  }

  sections[name] = section;
  // save the road directions on the map Array object
  section.roads   = roads;
  section.sprites = sprites;
  section.name    = name;
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
  tiles.roads   = section.roads;
  tiles.sprites = section.sprites;
  return tiles;
};

var cloneSection = function (section) {
  var tiles = [];
  for (var i = 0; i < section.length; i++) {
    tiles[i] = _.clone(section[i]);
  }
  tiles.roads = section.roads;
  tiles.sprites = section.sprites;
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
    tiles:    _(tiles).map(function (t) { return t.toString(); }).join(''),
    roads:    tiles.roads,
    sprites:  tiles.sprites,
    position: config.position
  };

  postMessage(JSON.stringify(message));
};
