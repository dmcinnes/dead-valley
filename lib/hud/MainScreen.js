define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var screen = $('#main-screen');

  var slideTime = 500;

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
    // screen.fadeOut(2000);
    screen.animate({left:-Game.GameWidth, opacity:0}, slideTime);

  }).subscribe('toggle pause', function () {
    if (!Game.isOver) {
      screen.addClass('pause');
      if (screen.position().left < 0) {
        screen.animate({left:0, opacity:1}, slideTime);
      } else {
        screen.animate({left:-Game.GameWidth, opacity:0}, slideTime);
      }
    }
  });
});
