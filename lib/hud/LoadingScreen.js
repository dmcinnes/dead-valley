define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var screen = $('#loading-screen');

  Overlay(screen);

  Game.events.subscribe('main screen loaded', function () {
    screen.hide();
  });
});
