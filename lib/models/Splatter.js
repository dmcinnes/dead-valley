// Blood Splatters!

define(['SpriteModel', 'Vector'], function (SpriteModel, Vector) {
  var MAX_LIFE = 45; // seconds
  var FADE_OUT = 5; // seconds

  var Splatter = function (pos, color, strength) {
    this.init({
      name: 'Splatter',
      z: 20
    });

    this.pos     = pos;
    this.pos.rot = 360 * Math.random(); // add a spin to the whole affair
    this.pos.retain();

    this.color   = color;
    this.life    = 0;
    this.dots    = [];

    this.createSplats(strength);
  };
  Splatter.prototype = new SpriteModel();
  Splatter.prototype.stationary = true;
  Splatter.prototype.fx         = true;

  Splatter.prototype.createSplats = function (strength) {
    var upperLeft  = Vector.create(Number.MAX_VALUE, Number.MAX_VALUE);
    var lowerRight = Vector.create(-Number.MAX_VALUE, -Number.MAX_VALUE);

    strength = strength || 0;

    // always need at least one
    var count = Math.round(Math.random() * 5) + strength + 1;

    for (var i = 0; i < count; i++) {
      var vector = Vector.create(360 * Math.random());
      vector.scale(Math.random() * 5);
      vector.size = Math.round(Math.random() * 2) + 1;
      vector.retain();
      this.dots.push(vector);
      // find the upper and lower bounds
      upperLeft.x  = Math.min(upperLeft.x, vector.x);
      upperLeft.y  = Math.min(upperLeft.y, vector.y);
      lowerRight.x = Math.max(lowerRight.x, vector.x + vector.size);
      lowerRight.y = Math.max(lowerRight.y, vector.y + vector.size);
    }

    var offset = upperLeft.multiply(-1);
    offset.retain();
    this.center = offset;

    for (i = 0; i < count; i++) {
      this.dots[i].translate(offset);
    }

    lowerRight.translate(offset);

    // set the tile size from our bounding calculation
    this.tileWidth  = lowerRight.x;
    this.tileHeight = lowerRight.y;
  };

  Splatter.prototype.postMove = function (delta) {
    this.life += delta;
    if (this.life > MAX_LIFE) {
      this.die();
    }

    if (MAX_LIFE - this.life < FADE_OUT) {
      this.opacity = 1 - (FADE_OUT - MAX_LIFE + this.life) / FADE_OUT;
    }
  };

  return Splatter;
});
