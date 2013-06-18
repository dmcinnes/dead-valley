define(['Game', 'GameTime', 'hud/Overlay', 'fx/Winning'], function (Game, GameTime, Overlay, Winning) {
  var timerId;
  var screen = $('#game-over-screen');
  var msg    = $('#game-over');
  var quitButton     = $('#quit-button');
  var continueButton = $('#continue-button');

  Overlay(screen);

  continueButton.click(function (e) {
    e.preventDefault();
    window.clearTimeout(timerId);
    Game.continueGame();
  });

  quitButton.click(function (e) {
    e.preventDefault();
    window.clearTimeout(timerId);
    completeGameOver();
  });

  var completeGameOver = function () {
    Game.events.fireEvent('game over complete');
  };

  Game.events.subscribe('game over', function () {

    var won = Game.dude.alive() && !GameTime.hasElapsed();
    if (won) {
      msg.text('You Made It!');
      Game.addSprite(Winning);
      screen.addClass('winning');
    } else {
      msg.text('GAME OVER');
      screen.removeClass('winning');
    }

    screen.fadeIn(5000, function () {
      if (!won && !GameTime.hasElapsed()) {
        // fade in all buttons
        $('.game-over-button').fadeIn(1000);
      }
    });

    timerId = window.setTimeout(completeGameOver, 15000);

  }).subscribe('game start,continue game', function () {
    screen.hide();
    $('.game-over-button').hide();
  });

});
