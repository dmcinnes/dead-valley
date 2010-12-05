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

  Vector.prototype.translate = function (vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  };

  Vector.prototype.scale = function (scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  };

  Vector.prototype.multiply = function (scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  };

  Vector.prototype.add = function (other) {
    return new Vector(this.x + other.x, this.y + other.y);
  };

  Vector.prototype.subtract = function (other) {
    return new Vector(this.x - other.x, this.y - other.y);
  };

  Vector.prototype.project = function (other) {
    // projected vector = (this dot v) * v;
    return other.multiply(this.dotProduct(other));
  };

  Vector.prototype.magnitude = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  return Vector;
});
