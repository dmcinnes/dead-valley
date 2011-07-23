define(['game'], function (game) {
  var tip = $("<div/>").addClass('tip');

  var canvasMask = $('#canvas-mask');

  game.events.subscribe('started touching', function (sprite) {
    if (sprite.tip) {
      tip.html(sprite.tip());
      var pos = sprite.pos;
      pos = game.map.canvasCoordinatesFromWorld(pos.x, pos.y);
      canvasMask.append(tip);
      tip.css({left:pos.x - tip.outerWidth()/2, top:pos.y - tip.outerHeight() - sprite.tileHeight});
    }
  }).subscribe('stopped touching', function (sprite) {
    tip.detach();
  }).subscribe('map scroll', function (vec) {
    var pos = tip.position();
    tip.css({left:pos.left - vec.x, top:pos.top - vec.y});
  });
});
