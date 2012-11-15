// Vector

define([], function () {

  var poolStart = null;
  var freeStart = null;

  var Vector = function () {
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
      return Vector.create(this.x * scalar, this.y * scalar);
    },

    add: function (other) {
      return Vector.create(this.x + other.x, this.y + other.y);
    },

    subtract: function (other) {
      return Vector.create(this.x - other.x, this.y - other.y);
    },

    project: function (other) {
      // projected vector = (this dot v) * v;
      return other.multiply(this.dotProduct(other));
    },

    magnitude: function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    normal: function () {
      return Vector.create(-this.y, this.x);
    },

    angle: function () {
      return Math.atan2(this.y, this.x); // radians
    },

    round: function () {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    },

    equals: function (other) {
      return this.x === other.x && this.y === other.y;
    },

    clone: function () {
      return Vector.create(this.x, this.y);
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

  Vector.create = function (x, y, retain) {
    var newVector;

    if (Vector.cache && !retain) {
      if (freeStart === poolStart) {
        Vector.reuseCount = 0;
      }

      if (freeStart) { // use a cached Vector
        newVector = freeStart;
        freeStart = freeStart.next;
        Vector.reuseCount++;
        newVector.rot = undefined; // just in case
      } else {         // create a new vector
        newVector = new Vector();
        newVector.next = poolStart;
        poolStart = newVector;
        Vector.count++;
      }

    } else {
      newVector = new Vector();
      newVector.retained = true;
    }

    if (y === undefined) { // it's an angle
      newVector.set(x);
    } else { 
      newVector.x = x;
      newVector.y = y;
    }

    return newVector;
  };

  return Vector;
});
