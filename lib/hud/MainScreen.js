define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var screen = $('#main-screen');

  Overlay(screen);

  $('#new-game').click(function () {
    Game.newGame();
  });

  $('#resume-game').click(function () {
    Game.events.fireEvent('toggle pause');
  });

  $('#instructions').click(function () {
    window.open('help.html');
  });

  Game.events.subscribe('everything loaded', function () {
    screen.fadeIn(2000, function () {
      Game.events.fireEvent('main screen loaded');
    });

  }).subscribe('game start', function () {
    screen.fadeOut(2000);

  }).subscribe('toggle pause', function () {
    if (!Game.isOver) {
      screen.toggleClass('pause');
      screen.toggle();
    }
  });
});
