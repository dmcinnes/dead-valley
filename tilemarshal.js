// a mixin for marshalling tiles to and from strings
// -- made this a mixin so our workers can use it without
//    dealing with the tile objects

// single character for each tile:
// top four bits: collidable, flip, and two for rotate
// bottom 12 bits for tile offset

define(function () {
  var tileMarshal = function (thing) {

    thing.prototype.toString = function () {
      var code = !this.collidable << 3;
      code += this.tileFlip << 2;
      code += this.tileRotate;
      code = code << 12;
      code += this.tileOffset;

      return String.fromCharCode(code);
    };

    thing.prototype.setFromString = function (str) {
      var code = str.charCodeAt(0);
      this.tileOffset = parseInt(code & 0x0FFF);
      this.collidable = !(code & 0x8000);
      this.tileFlip   = !!(code & 0x4000);
      this.tileRotate = (code & 0x3000) >> 12;
      this.nextSprite = null; // clean up any sprite remnants
    };

    thing.prototype.oldSetFromString = function (str) {
      this.tileOffset = parseInt(str);

      var arr = str.split('');
      this.collidable = arr.pop() === 'C';
      this.tileRotate = parseInt(arr.pop());
      this.tileFlip   = arr.pop() === 'F';
    };

  };

  return tileMarshal;
});
