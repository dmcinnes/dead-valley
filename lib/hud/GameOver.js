define(['Game', 'GameTime', 'hud/Overlay'], function (Game, GameTime, Overlay) {
  var screen = $('#game-over-screen');
  var msg    = $('#game-over');
  var continueButton = $('#continue-button');

  Overlay(screen);

  continueButton.click(function (e) {
    e.preventDefault();
  });

  Game.events.subscribe('game over', function () {

    var won = Game.dude.alive() && !GameTime.hasElapsed();
    if (won) {
      msg.text('You Made It!');
    } else {
      msg.text('Game Over');
    }

    screen.fadeIn(5000, function () {
      if (!won) {
	continueButton.fadeIn(1000);
      }
    });

  }).subscribe('game start', function () {
    screen.hide();
    continueButton.hide();
  });

});
