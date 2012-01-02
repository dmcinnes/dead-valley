// Headlight

define(['Game', 'Sky'], function (Game, Sky) {
  var context = Game.skyContext;
  
  var length    = 450; // 150 ft
  var halfWidth = 50;
  var lampHW    = 3;

  var render = function (sprite, offset) {
    var pos = sprite.pos;
    var map = Game.map;
    context.save();
    context.translate(pos.x - map.originOffsetX, pos.y - map.originOffsetY);
    context.rotate(pos.rot * Math.PI / 180);
    context.translate(offset.x, offset.y);
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.moveTo(-lampHW, 0);
    context.lineTo(-halfWidth, -length);
    context.arc(0, -length, halfWidth, Math.PI, Math.PI*2);
    context.lineTo(lampHW, 0);
    context.arc(0, 0, lampHW, 0, Math.PI);
    context.fill();
    context.restore();
  };

  return {
    render: render,
    length: length + halfWidth
  };
});
