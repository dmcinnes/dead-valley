define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var overlay = $('#pause-overlay');

  Overlay(overlay, function () {
    // do this on click
    Game.events.fireEvent('toggle pause');
  });

  Game.events.subscribe('pause', function () {
    if (!Game.isOver) {
      overlay.show();
    }
  }).subscribe('play', function () {
    overlay.hide();
  });
});
