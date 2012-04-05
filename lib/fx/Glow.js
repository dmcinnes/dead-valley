define(['Game', 'Sprite', 'Sky'], function (Game, Sprite, Sky) {
  var context = Game.skyContext;
  var map = Game.map;

  var Glow = function (sprite) {
    this.blur = 10;
    this.sprite = sprite;
    this.pos = sprite.pos;
    this.pos.retain();
  };
  Glow.prototype = new Sprite();
  Glow.prototype.fx         = true;
  Glow.prototype.stationary = true;

  Glow.prototype.render = function () {
    var map    = Game.map;
    var sprite = this.sprite;

    context.save();

    context.translate(sprite.pos.x - map.originOffsetX,
                      sprite.pos.y - map.originOffsetY);
    context.rotate(sprite.pos.rot * Math.PI / 180);
    context.translate(-sprite.center.x, -sprite.center.y);

    context.shadowBlur = this.blur;
    context.shadowColor = "red";
    sprite.renderToContext(context);

    context.shadowBlur = 0;
    context.globalCompositeOperation = "destination-out";
    sprite.renderToContext(context);

    context.restore();

    Sky.dirty = true;
  };

  return {
    create: function (sprite) {
      var glow = new Glow(sprite);
      Game.sprites.push(glow);
      return glow;
    }
  };
});
