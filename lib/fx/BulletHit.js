
define(['Game', 'Sprite', 'Sky'], function (Game, Sprite, Sky) {

  var context = Game.skyContext;

  // length and range are negitive because the default
  // is to send sparks back toward the shooter
  var defaultConfig = {
    color:     'white',
    minLength: -5,
    range:     -10,
    lifetime:  0.2,
    size:      1
  };

  var Sparks = function (result, config) {
    this.pos     = result.point.clone();
    this.pos.rot = 0;
    this.pos.retain();

    this.life    = 0;

    var norm     = result.normal;
    var dir      = result.direction;
    // generates a reflection about the normal
    var reflect  = norm.multiply(2 * dir.dotProduct(norm) / norm.dotProduct(norm)).subtract(dir);

    // allow overrides
    $.extend(this, config);

    this.sparks = this.createSparks(norm, dir, reflect, config);

    _.each(this.sparks, function (spark) {
      spark.retain();
      spark.life = config.lifetime - config.lifetime * Math.random();
    });
  };
  Sparks.prototype = new Sprite();
  Sparks.prototype.stationary = true;
  Sparks.prototype.fx         = true;

  Sparks.prototype.createSparks = function (norm, dir, reflect, config) {
    return [
      norm.multiply(this.minLength    + Math.random() * this.range),
      dir.multiply(this.minLength     + Math.random() * this.range),
      reflect.multiply(this.minLength + Math.random() * this.range)
    ];
  };

  Sparks.prototype.postMove = function (delta) {
    this.life += delta;
    if (this.life > this.lifetime) {
      this.die();
    }
  };

  // override render
  Sparks.prototype.render = function (delta) {
    var map = Game.map;
    context.save();
    context.translate(this.pos.x - map.originOffsetX, this.pos.y - map.originOffsetY);
    context.fillStyle = this.color;
    var size = this.size;
    var life = this.life;
    var percent = life / this.lifetime;
    var pos;
    _.each(this.sparks, function (spark) {
      if (life < spark.life) {
        pos = spark.multiply(percent);
        context.fillRect(pos.x, pos.y, size, size);
      }
    });
    context.restore();
    Sky.dirty = true;
  };

  var BulletHit = function (config) {
    this.config = $.extend({}, defaultConfig, config);
  };

  BulletHit.prototype.fireSparks = function (result) {
    Game.sprites.push(new Sparks(result, this.config));
  };

  return BulletHit;
});
