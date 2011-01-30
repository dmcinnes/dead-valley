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

// load meta map tiles
var metaTiles = {};
importScripts('maps/vertical_road.json');

// generates a map filed with blank, dirt and scrub tiles
var generateBlankMap = function (total) {
  var tiles = [];

  for (var i = 0; i < total; i++) {
    var tile = new Tile();
    tile.tileOffset =
      (Math.random() > 0.9) ? Math.floor(Math.random()*2) + 1 : 0;
    tile.tileFlip = Math.random() > 0.5;
    tile.tileRotate = 0; // Math.floor(Math.random() * 4);
    tiles.push(tile);
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

onmessage = function (e) {
  var config = JSON.parse(e.data);
  var total = config.width * config.height;

  var tiles = generateBlankMap(total);

  layRoads(tiles, config);

  var message = {
    type: 'newtiles',
    tiles: _(tiles).map(function (t) { return t.toString(); })
  };

  postMessage(JSON.stringify(message));
};
