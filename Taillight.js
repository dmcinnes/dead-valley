// taillight

define(['game'], function (game) {
  var context = game.skyContext;
  
  var lampHW    = 2;

  var render = function (sprite, tile, on) {
    context.save();
    sprite.configureTransform(context);
    if (on) {
      context.globalAlpha = 1;
      context.shadowBlur = 10.0;
      context.shadowColor = 'red';
    } else {
      context.globalAlpha = 0.5;
    }
    sprite.drawTile(tile, false, context);
    context.restore();
  };

  return {
    render: render
  };
});
