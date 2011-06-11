
define(['game', 'Sprite'], function (game, Sprite) {
  var LIFETIME = 0.2; // seconds

  var length = 10;

  var context = game.spriteContext;

  var BulletHit = function (result) {
    var norm     = result.normal;
    var dir      = result.direction;
    // generates a reflection about the normal
    var reflect  = norm.multiply(2 * dir.dotProduct(norm) / norm.dotProduct(norm)).subtract(dir);

    this.pos     = result.point;
    this.pos.rot = 0; // (Math.atan2(dir.y, dir.x) * 180 / Math.PI) + 90;
    this.life    = 0;

    this.sparks = [
      norm.multiply(-5 - Math.random() * 10),
      dir.multiply(-5 - Math.random() * 10),
      reflect.multiply(-5 - Math.random() * 10)
    ];

    _.each(this.sparks, function (spark) {
      spark.life = LIFETIME - LIFETIME * Math.random();
    });
  };
  BulletHit.prototype = new Sprite();

  BulletHit.prototype.postMove = function (delta) {
    this.life += delta;
    if (this.life > LIFETIME) {
      this.die();
    }
  };

  BulletHit.prototype.draw = function (delta) {
    context.fillStyle = 'white';
    var life = this.life;
    var percent = life / LIFETIME;
    var pos;
    _.each(this.sparks, function (spark) {
      if (life < spark.life) {
        pos = spark.multiply(percent);
        context.fillRect(pos.x, pos.y, 2, 2);
      }
    });
  };

  // don't need these methods
  BulletHit.prototype.move             = function () {};
  BulletHit.prototype.transformNormals = function () {};
  BulletHit.prototype.updateGrid       = function () {};

  return BulletHit;
});
