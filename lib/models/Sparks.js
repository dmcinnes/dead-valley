define(['SpriteModel'], function (SpriteModel) {

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
  Sparks.prototype = new SpriteModel();
  Sparks.prototype.stationary = true;
  Sparks.prototype.fx         = true;

  Sparks.prototype.clazz = 'Sparks';

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

  return Sparks;
});
