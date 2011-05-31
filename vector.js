// Vector

define(function () {
  var Vector = function (x, y) {
    if (y === undefined) { // it's an angle
      this.set(x);
    } else { 
      this.x = x;
      this.y = y;
    }
  };

  Vector.prototype.set = function (other) {
    if (arguments.length > 1) {
      this.x = arguments[0];
      this.y = arguments[1];
    } else if (typeof(other) === 'number') {
      var rad = (other * Math.PI) / 180;
      this.x = Math.cos(rad);
      this.y = Math.sin(rad);
    } else if (other) {
      this.x = other.x;
      this.y = other.y;
    }
    return this;
  };

  Vector.prototype.normalize = function (other) {
    var mag = this.magnitude();
    if (mag) {
      this.x /= mag;
      this.y /= mag;
    }
    return this;
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

  Vector.prototype.normal = function () {
    return new Vector(-this.y, this.x);
  };

  Vector.prototype.clone = function () {
    return new Vector(this.x, this.y);
  };

  Vector.prototype.toString = function () {
    return [this.x, this.y].join(',');
  };

  return Vector;
});
