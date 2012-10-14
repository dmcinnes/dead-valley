// Blood Splatters!

define(['Game', 'Sprite', 'Vector'], function (Game, Sprite, Vector) {
  var MAX_LIFE = 45; // seconds
  var FADE_OUT = 5; // seconds

  var currentSplats = [];
  var maxSplats     = 10; // number of splats on the screen at a time

  var Splatter = function (pos, color, str) {
    this.pos     = pos;
    this.pos.rot = 0;
    this.pos.retain();

    this.color   = color;
    this.life    = 0;
    this.dots    = [];
    this.z       = 20;

    str = str || 0;

    this.createSplats(str);
    this.createNode();
    this.drawSplatter();
  };
  Splatter.prototype = new Sprite();
  Splatter.prototype.stationary = true;
  Splatter.prototype.fx         = true;

  Splatter.prototype.createSplats = function (strength) {
    var upperLeft  = Vector.create(Number.MAX_VALUE, Number.MAX_VALUE);
    var lowerRight = Vector.create(-Number.MAX_VALUE, -Number.MAX_VALUE);

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

  Splatter.prototype.createNode = function () {
    this.node = $('<canvas/>').attr('width', this.tileWidth).attr('height', this.tileHeight);
    this.node.addClass('sprite');
    this.node.css('z-index', this.z);

    // add a spin to the whole affair
    this.pos.rot = 360 * Math.random();

    this.spriteParent.append(this.node);
  };

  Splatter.prototype.postMove = function (delta) {
    this.life += delta;
    if (this.life > MAX_LIFE) {
      this.die();
    }
  };

  Splatter.prototype.draw = function () {
    if (MAX_LIFE - this.life < FADE_OUT) {
      this.opacity = 1 - (FADE_OUT - MAX_LIFE + this.life) / FADE_OUT;
    }
  };

  Splatter.prototype.drawSplatter = function () {
    var context = this.node[0].getContext('2d');
    context.fillStyle = this.color;
    context.shadowBlur = 1;
    var count = this.dots.length;
    for (var i = 0; i < count; i++) {
      var vector = this.dots[i];
      context.fillRect(vector.x, vector.y, vector.size, vector.size);
    }
  };

  Splatter.prototype.cleanupDomNodes = function () {
    if (this.node) {
      this.node.remove();
      this.node = null;
    }
  };

  var splat = function (pos, color, strength) {
    var splatter = new Splatter(pos, color, strength);
    Game.sprites.push(splatter);
    // keep track of existing splats
    currentSplats.push(splatter);
    if (currentSplats.length > maxSplats) {
      var reclaimed = currentSplats.shift();
      reclaimed.die();
    }
  };

  return {
    splat: splat
  };
});
