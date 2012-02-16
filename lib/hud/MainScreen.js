define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var screen = $('#main-screen');

  Overlay(screen);

  $('#new-game').click(function () {
    Game.newGame();
    screen.fadeOut(2000);
  });

  $('#resume-game').click(function () {
    Game.events.fireEvent('toggle pause');
  });

  Game.events.subscribe('everything loaded', function () {
    screen.fadeIn(2000, function () {
      Game.events.fireEvent('main screen loaded');
    });
  }).subscribe('pause', function () {
    screen.addClass('pause');
    if (!Game.isOver) {
      screen.show();
    }
  }).subscribe('play', function () {
    screen.removeClass('pause');
    screen.hide();
  });
});
