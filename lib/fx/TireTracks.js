
define(['Game', 'Sprite'], function (Game, Sprite) {
  var width       = 4;
  var halfWidth   = width/2;
  var maxLife     = 60; // seconds
  var maxLength   = 40; // in dots
  var minVelocity = 10;

  var context = Game.spriteContext;

  var TireTracks = function (car, wheel, color, length) {
    this.pos     = Vector.create(0, 0);
    this.pos.rot = 0;
    this.car     = car;
    this.wheel   = wheel;
    this.color   = color;
    this.length  = length || maxLength;
    this.life    = 0;
    this.dots    = [];

    this.wheel.tracks = this;
  };
  TireTracks.prototype = new Sprite();
  TireTracks.prototype.stationary = true;
  TireTracks.prototype.fx         = true;

  TireTracks.prototype.z = 1;

  TireTracks.prototype.preMove = function () {
    if (this.dots.length < this.length &&
        Math.abs(this.wheel.speed) > 4) {
      var pos = this.car.pos.add(this.wheel.position);
      // make sure we're not too close to the last one
      if (!this.dots.length ||
          _.last(this.dots).subtract(pos).magnitude() > width/2) {
        // add a new dot
        pos.rot = (this.car.pos.rot * Math.PI)/180; // convert to radians
        this.dots.push(pos);
      }
    }
  };

  TireTracks.prototype.postMove = function (delta) {
    // only start counting life when we're showing something
    if (this.dots.length) {
      this.life += delta;
      if (this.life > maxLife) {
        this.die();
      }
      if (this.wheel && this.dots.length == this.length) {
        this.wheel.tracks = null;
        this.wheel = null;
      }
    }
  };

  TireTracks.prototype.draw = function (delta) {
    // if (this.dots.length > 1) {
    //   context.fillStyle = this.color;
    //   context.shadowBlur  = 1;
    //   context.globalAlpha = 1 - this.life / maxLife;
    //   var count = this.dots.length;
    //   for (var i = 0; i < count; i++) {
    //     context.save();
    //     var vector = this.dots[i];
    //     context.translate(vector.x, vector.y);
    //     context.rotate(vector.rot);
    //     context.fillRect(-halfWidth, -halfWidth, width, width);
    //     context.restore();
    //   }
    // }
  };

  TireTracks.prototype.die = function () {
    Sprite.prototype.die.call(this);
  };

  var splat = function (car, wheel, color, length) {
    // TODO reenable when we know a way to do this
    // // ignore if wheel is already tracking something
    // if (!wheel.tracks) {
    //   // put it at the beginning of the sprite list so it renders first
    //   Game.sprites.unshift(new TireTracks(car, wheel, color, length));
    // }
  };

  return {
    splat: splat
  };
});
