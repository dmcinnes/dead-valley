define(['Game', 'Sky'], function (Game, Sky) {

  var context = Game.skyContext;
  
  var render = function (pos, direction, length, offset) {
    if (Sky.isDark()) {
      var map = Game.map;

      length = length || this.length;
      offset = offset || this.offset;

      context.save();

      context.globalCompositeOperation = 'destination-out';

      context.translate(pos.x - map.originOffsetX, pos.y - map.originOffsetY);
      context.rotate(direction);
      context.translate(offset.x, offset.y);

      context.beginPath();
      context.moveTo(-this.lampHW, 0);
      context.lineTo(-this.halfWidth, -length);
      context.arc(0, -length, this.halfWidth, 0, Math.PI*2);
      context.lineTo(this.lampHW, 0);
      context.arc(0, 0, this.lampHW, 0, Math.PI);
      context.fill();

      context.restore();
    }
  };

  return function (config) {
    return _.bind(render, config);
  };

});
