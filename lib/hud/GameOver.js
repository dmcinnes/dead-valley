define(['Game', 'GameTime', 'hud/Overlay'], function (Game, GameTime, Overlay) {
  var screen = $('#game-over-screen');
  var msg    = $('#game-over');

  Overlay(screen);

  Game.events.subscribe('game over', function () {

    if (Game.dude.alive() && !GameTime.hasElapsed()) {
      msg.text('You Made It!');
    } else {
      msg.text('Game Over');
    }

    screen.fadeIn(5000, function () {
    });

  }).subscribe('game start', function () {
    screen.hide();
  });

});
