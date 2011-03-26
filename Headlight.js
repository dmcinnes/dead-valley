// Headlight

define(['game'], function (game) {
  var context = game.skyContext;
  
  var length    = 450; // 150 ft
  var halfWidth = 50;
  var lampHW    = 3;

  var render = function (sprite, pos) {
    context.save();
    context.shadowBlur = 5.0;
    sprite.configureTransform(context);
    context.translate(pos.x, pos.y);
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.moveTo(-lampHW, 0);
    context.lineTo(-halfWidth, -length);
    context.arc(0, -length, halfWidth, Math.PI, Math.PI*2);
    context.lineTo(lampHW, 0);
    context.arc(0, 0, lampHW, 0, Math.PI);
    context.fill();
    context.globalCompositeOperation = 'source-over';
    context.restore();
  };

  return {
    render: render
  };
});
