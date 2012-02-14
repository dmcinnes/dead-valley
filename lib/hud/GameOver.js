define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var overlay   = $('#game-over-overlay');
  var playAgain = $('#play-again');

  Overlay(overlay);

  $('#play-again').click(function (e) {
    e.preventDefault();
    playAgain.hide();
    overlay.fadeOut(2000);
    Game.newGame();
  });

  Game.events.subscribe('game over', function () {
    overlay.fadeIn(5000, function () {
      playAgain.fadeIn(1000);
    });
  });
});
