define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var screen   = $('#game-over-screen');
  var playAgain = $('#play-again');

  Overlay(screen);

  $('#play-again').click(function (e) {
    e.preventDefault();
    playAgain.hide();
    screen.fadeOut(2000);
    Game.newGame();
  });

  Game.events.subscribe('game over', function () {
    screen.fadeIn(5000, function () {
      playAgain.fadeIn(1000);
    });
  });
});
