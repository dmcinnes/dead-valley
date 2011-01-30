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
var sections = {};
importScripts('maps/vertical_road.json');

// convert them into objects
_(sections).each(function (data) {
  for (var i = 0; i < data.length; i++) {
    var tile = new Tile();
    tile.setFromString(data[i]);
    data[i] = tile;
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

var createBlankSection = function (length) {
  var tiles = [];
  for (var i = 0; i < length; i++) {
    tiles.push(new Tile());
  }
  return tiles;
};

var layRoads = function (tiles, config) {
  // are there any roads in the map slice we've been given?
  var strip = config.strip;
  var length = strip.length;
  var roads = [];
  var begin;
  for (var i = 0; i < length; i++) {
    if (strip[i].tileOffset == 3) { // road edge
      if (begin) {
        roads.push([begin, i]);
        begin = null;
      } else {
        begin = i;
      }
    };
  }

  if (roads.length) {
  }

  switch (config.direction) {
    case 'south':

      break;
  }
};

var loadSection = function (config) {
  // TODO have to do transformation if tile should be
  // rotated vertically
  return _.clone(sections[config.section]);
};

onmessage = function (e) {
  var config = JSON.parse(e.data);
  var total = config.width * config.height;

  // if (config.section) {
    var tiles = loadSection(config);
  // } else {
  //   var tiles = createBlankSection(total);
    // figure out what kind of section use
  // }

  fillBlankTiles(tiles);

  var message = {
    type: 'newtiles',
    tiles: _(tiles).map(function (t) { return t.toString(); })
  };

  postMessage(JSON.stringify(message));
};
