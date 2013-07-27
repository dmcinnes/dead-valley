// taillight

define(['Game', 'Sky'], function (Game, Sky) {
  var context = Game.skyContext;
  
  var lampHW    = 2;

  var render = function (sprite, tile, on) {
    if (Sky.isDark()) {
      var model = sprite.model;
      var pos   = model.pos;
      var map   = Game.map;
      context.save();
      context.translate(pos.x - map.originOffsetX, pos.y - map.originOffsetY);
      context.rotate(pos.rot * Math.PI / 180);
      if (on) {
        context.globalAlpha = 1;
        context.shadowBlur = 10.0;
        context.shadowColor = 'red';
      } else {
        context.globalAlpha = 0.5;
      }
      context.drawImage(sprite.imageData,
                        sprite.imageOffset.x + tile * model.tileWidth,
                        sprite.imageOffset.y,
                        model.tileWidth,
                        model.tileHeight,
                        -model.center.x,
                        -model.center.y,
                        model.tileWidth,
                        model.tileHeight);
      context.restore();
      Sky.dirty = true;
    }
  };

  return {
    render: render
  };
});
