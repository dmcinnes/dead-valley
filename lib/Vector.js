// Vector

define([], function () {

  var poolStart = null;
  var freeStart = null;

  var Vector = function (x, y, retain) {
    var newVector;

    if (Vector.cache && !retain) {
      if (freeStart === poolStart) {
        Vector.reuseCount = 0;
      }

      if (freeStart) { // use a cached Vector
        newVector = freeStart;
        freeStart = freeStart.next;
        Vector.reuseCount++;
        delete newVector.rot; // just in case
      } else {         // create a new vector
        newVector = this;
        newVector.next = poolStart;
        poolStart = newVector;
        Vector.count++;
      }

    } else {
      this.retained = true;
      newVector = this;
    }

    if (y === undefined) { // it's an angle
      newVector.set(x);
    } else { 
      newVector.x = x;
      newVector.y = y;
    }

    return newVector;
  };

  Vector.prototype = {
    set: function (other) {
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
    },

    normalize: function () {
      var mag = this.magnitude();
      if (mag) {
        this.x /= mag;
        this.y /= mag;
      }
      return this;
    },

    dotProduct: function (other) {
      return this.x * other.x + this.y * other.y;
    },

    crossProduct: function (other) {
      return this.x * other.y - this.y * other.x;
    },

    translate: function (vector) {
      this.x += vector.x;
      this.y += vector.y;
      return this;
    },

    scale: function (scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    },

    multiply: function (scalar) {
      return new Vector(this.x * scalar, this.y * scalar);
    },

    add: function (other) {
      return new Vector(this.x + other.x, this.y + other.y);
    },

    subtract: function (other) {
      return new Vector(this.x - other.x, this.y - other.y);
    },

    project: function (other) {
      // projected vector = (this dot v) * v;
      return other.multiply(this.dotProduct(other));
    },

    magnitude: function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    normal: function () {
      return new Vector(-this.y, this.x);
    },

    equals: function (other) {
      return this.x === other.x && this.y === other.y;
    },

    clone: function () {
      return new Vector(this.x, this.y);
    },

    toString: function () {
      return this.x + ',' + this.y;
    },

    // don't let this instance be re-allocated
    retain: function () {
      if (!this.retained) {
        this.retained = true;
        var vec = poolStart;
        var prev = null;
        while (vec !== this) {
          prev = vec;
          vec = vec.next;
        }
        if (prev) {
          prev.next = this.next;
        } else {
          // we're the first
          poolStart = this.next;
        }
        delete this.next;
      }
    },

    free: function () {
      if (this.retained) {
        this.retained = false;
        this.next = poolStart;
        poolStart = this;
        Vector.count++;
      }
    }
  };

  Vector.count = 0;
  Vector.reuseCount = 0;
  Vector.cache = true;

  Vector.freeAllocated = function () {
    freeStart = poolStart;
  };

  return Vector;
});
