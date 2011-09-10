define(['Game'], function (Game) {
  var overlay = $('#pause-overlay');

  var mouseEvents = "click, dblclick, mousedown, mouseup, mousemove, mouseover, mouseout, mouseenter, mouseleave";

  overlay.bind(mouseEvents, function (e) {
    e.stopImmediatePropagation();
    return false;
  });

  Game.events.subscribe('pause', function () {
    overlay.show();
  }).subscribe('play', function () {
    overlay.hide();
  });
});
