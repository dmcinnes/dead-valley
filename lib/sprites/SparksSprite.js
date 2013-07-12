define(['Game', 'Sprite', 'Sky'], function (Game, Sprite, Sky) {

  var context = Game.skyContext;

  var Sparks = function (model) {
    this.model = model;
  };
  Sparks.prototype = new Sprite();

  // override render
  Sparks.prototype.render = function (delta) {
    var model = this.model;
    var map = Game.map;
    context.save();
    context.translate(model.pos.x - map.originOffsetX, model.pos.y - map.originOffsetY);
    context.fillStyle = model.color;
    var size = model.size;
    var life = model.life;
    var percent = life / model.lifetime;
    var pos;
    _.each(model.sparks, function (spark) {
      if (life < spark.life) {
        pos = spark.multiply(percent);
        context.fillRect(pos.x, pos.y, size, size);
      }
    });
    context.restore();
    Sky.dirty = true;
  };

  return Sparks;
});
