// Headlight

define(['game'], function (game) {
  var context = game.skyContext;
  
  var render = function (sprite, pos) {
    context.save();
    context.shadowBlur = 5.0;
    sprite.configureTransform(context);
    context.translate(pos.x, pos.y);
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.moveTo(-3, 0);
    context.lineTo(-40, -300);
    context.arc(0, -300, 40, Math.PI, Math.PI*2);
    context.lineTo(3, 0);
    context.arc(0, 0, 3, 0, Math.PI);
    context.fill();
    context.globalCompositeOperation = 'source-over';
    context.restore();
  };

  return {
    render: render
  };
});
