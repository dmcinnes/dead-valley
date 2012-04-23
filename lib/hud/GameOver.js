define(['Game', 'GameTime', 'hud/Overlay', 'fx/Winning'], function (Game, GameTime, Overlay, Winning) {
  var timerId;
  var screen = $('#game-over-screen');
  var msg    = $('#game-over');
  var continueButton = $('#continue-button');

  Overlay(screen);

  continueButton.click(function (e) {
    e.preventDefault();
    window.clearTimeout(timerId);
    Game.continueGame();
  });

  Game.events.subscribe('game over', function () {

    var won = Game.dude.alive() && !GameTime.hasElapsed();
    if (won) {
      msg.text('You Made It!');
      Game.addSprite(Winning);
      screen.addClass('winning');
    } else {
      msg.text('Game Over');
      screen.removeClass('winning');
    }

    screen.fadeIn(5000, function () {
      if (!won && !GameTime.hasElapsed()) {
        continueButton.fadeIn(1000);
      }
    });

    timerId = window.setTimeout(function () {
      Game.events.fireEvent('game over complete');
    }, 15000);

  }).subscribe('game start,continue game', function () {
    screen.hide();
    continueButton.hide();
  });

});
