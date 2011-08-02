// Blood Splatters!

define(['game', 'Sprite'], function (game, Sprite) {
  var maxLife = 60; // seconds

  var context = game.spriteContext;

  var Splatter = function (pos, color, str) {
    this.pos     = pos;
    this.pos.rot = 0;
    this.color   = color;
    this.life    = 0;

    str = str || 0;

    this.dots = [];
    var count = Math.round(Math.random() * 5) + str;
    for (var i = 0; i < count; i++) {
      var vector = new Vector(360 * Math.random());
      vector.scale(Math.random() * 5);
      vector.size = Math.round(Math.random() * 2) + 1;
      this.dots.push(vector);
    }
  };
  Splatter.prototype = new Sprite();

  Splatter.prototype.postMove = function (delta) {
    this.life += delta;
    if (this.life > maxLife) {
      this.die();
    }
  };

  Splatter.prototype.draw = function (delta) {
    // context.fillStyle = this.color;
    // context.shadowBlur = 1;
    // context.globalAlpha = 1 - this.life / maxLife;
    // var count = this.dots.length;
    // for (var i = 0; i < count; i++) {
    //   var vector = this.dots[i];
    //   context.fillRect(vector.x, vector.y, vector.size, vector.size);
    // }
  };

  // don't need these methods
  Splatter.prototype.move             = function () {};
  Splatter.prototype.transformNormals = function () {};
  Splatter.prototype.updateGrid       = function () {};

  var splat = function (pos, color, strength) {
    // put it at the beginning of the sprite list so it renders first
    game.sprites.unshift(new Splatter(pos, color, strength));
  };

  return {
    splat: splat
  };
});
