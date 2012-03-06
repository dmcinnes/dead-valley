define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var screen = $('#game-over-screen');
  var msg    = $('#game-over');

  Overlay(screen);

  Game.events.subscribe('game over', function () {
    if (Game.dude.alive()) {
      msg.text('You Win!');
    } else {
      msg.text('Game Over');
    }

    screen.fadeIn(5000, function () {
    });
  }).subscribe('game start', function () {
    screen.hide();
  });

});
