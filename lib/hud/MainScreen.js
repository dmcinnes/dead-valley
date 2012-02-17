define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var screen  = $('#main-screen');
  var content = $('#main-content');

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
    screen.animate({opacity:0}, slideTime, function () {
      screen.hide();
    });
    content.animate({left:-Game.GameWidth, opacity:0}, slideTime);

  }).subscribe('toggle pause', function () {
    if (!Game.isOver) {
      screen.addClass('pause');
      if (screen.is(':visible')) {
        screen.animate({opacity:0}, slideTime, function () {
          screen.hide();
        });
        content.animate({left:-Game.GameWidth, opacity:0}, slideTime);
      } else {
        screen.show();
        screen.animate({opacity:1}, slideTime);
        content.animate({left:0, opacity:1}, slideTime);
      }
    }
  });
});
