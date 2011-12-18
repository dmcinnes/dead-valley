define(['Game'], function (Game) {
  var overlay = $('#game-over-overlay');

  var mouseEvents = "click, dblclick, mousedown, mouseup, mousemove, mouseover, mouseout, mouseenter, mouseleave";

  overlay.bind(mouseEvents, function (e) {
    e.stopImmediatePropagation();
    return false;
  });

  Game.events.subscribe('game over', function () {
    overlay.fadeIn(5000);
  });
});
