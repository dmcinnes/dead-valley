define(['game'], function (game) {
  var tip = $("<div/>").addClass('tip');

  var canvasMask = $('#canvas-mask');

  game.events.subscribe('started touching', function (sprite) {
    if (sprite.tip) {
      tip.html(sprite.tip());
      var pos = sprite.pos;
      pos = game.map.canvasCoordinatesFromWorld(pos.x, pos.y);
      tip.css({left:pos.x, top:pos.y});
      canvasMask.append(tip);
    }
  }).subscribe('stopped touching', function (sprite) {
    tip.detach();
  });
});
