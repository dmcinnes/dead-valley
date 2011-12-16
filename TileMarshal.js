// a mixin for marshalling tiles to and from strings
// -- made this a mixin so our workers can use it without
//    dealing with the tile objects

// single character for each tile:
// top four bits: collidable, flip, and two for rotate
// bottom 12 bits for tile offset

define([], function () {

  // which tiles are considered roads
  var roadTiles = [3,4,5,6,7,8,9,
                   12,13,14,15,16,17,
                   20,21,22,23,24,25,26,
                   28,29,30,31,32,33,34,
                   36,37,38,39,40,41,
                   44,45,46,47,
                   50,
                   53,54,55,56,
                   59,
                   76,77,
                   85,86,
                   90,91,92,93,94,95];

  var roadTilesMap = [];

  _.each(roadTiles, function (tile) {
    roadTilesMap[tile] = true;
  });


  var tileMarshal = function (thing) {

    thing.prototype.toString = function () {
      var code = 1 << 3;
      code += this.tileFlip << 2;
      code += this.tileRotate;
      code = code << 12;
      code += this.tileOffset;

      return String.fromCharCode(code);
    };

    thing.prototype.setFromString = function (str) {
      var code = str.charCodeAt(0);
      this.tileOffset = parseInt(code & 0x0FFF, 10);
      this.tileFlip   = !!(code & 0x4000);
      this.tileRotate = (code & 0x3000) >> 12;
      this.isRoad     = !!roadTilesMap[this.tileOffset];
      this.nextSprite = null; // clean up any sprite remnants
      this.entrance   = null;
    };

  };

  return tileMarshal;
});
