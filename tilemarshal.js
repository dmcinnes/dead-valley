// a mixin for marshalling tiles to and from strings
// -- made this a mixin so our workers can use it without
//    dealing with the tile objects

define(function () {
  var tileMarshal = function (thing) {

    thing.prototype.toString = function () {
      return [this.tileOffset,
              this.tileFlip ? 'F' : 'N',
              this.tileRotate,
              this.collidable ? 'C' : 'N'].join('');
    };

    thing.prototype.setFromString = function (str) {
      this.tileOffset = parseInt(str);

      var arr = str.split('');
      this.collidable = arr.pop() == 'C';
      this.tileRotate = parseInt(arr.pop());
      this.tileFlip   = arr.pop() == 'F';
    };

  };

  return tileMarshal;
});
