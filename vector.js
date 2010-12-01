// Vector

define(function () {
  var Vector = function (x, y) {
    this.x = x;
    this.y = y;
  };

  Vector.prototype.dotProduct = function (other) {
    return this.x * other.x + this.y * other.y;
  };

  Vector.prototype.crossProduct = function (other) {
    return this.x * other.y - this.y * other.x;
  };

  return Vector;
});
