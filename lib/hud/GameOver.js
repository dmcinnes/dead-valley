define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var screen   = $('#game-over-screen');

  Overlay(screen);

  Game.events.subscribe('game over', function () {
    screen.fadeIn(5000, function () {
      window.setTimeout(function () {
        screen.fadeOut(2000);
      }, 2000);
    });
  });
});
