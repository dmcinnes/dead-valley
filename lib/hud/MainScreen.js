define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var $screen  = $('#main-screen');
  var $content = $('#main-content');
  var $menu    = $screen.find('ul');

  var slideTime = 500;

  Overlay($screen);

  if (Game.hasSavedGame()) {
    $('#resume-game').addClass('selected').show();
  } else {
    $('#new-game').addClass('selected');
  }

  var Menu = {
    newGame: function () {
      Game.newGame();
    },
    resumeGame: function () {
      if (Game.isOver) {
        Game.loadSavedGame();
      } else {
        // game already running -- unpause
        Game.events.fireEvent('toggle pause');
      }
    },
    instructions: function () {
      window.open('help.html');
    },
    about: function () {
    }
  };

  $('#new-game').click(Menu.newGame);
  $('#resume-game').click(Menu.resumeGame);
  $('#instructions').click(Menu.instructions);
  $('#about').click(Menu.about);

  Game.events.subscribe('everything loaded', function () {
    $screen.fadeIn(2000, function () {
      Game.events.fireEvent('main screen loaded');
    });

  }).subscribe('game start', function () {
    $screen.animate({opacity:0}, slideTime, function () {
      $screen.hide();
    });
    $content.animate({left:-Game.GameWidth, opacity:0}, slideTime);

  }).subscribe('toggle pause', function () {
    if (!Game.isOver) {
      $screen.addClass('pause');

      if ($screen.is(':visible')) {
        $screen.animate({opacity:0}, slideTime, function () {
          $screen.hide();
        });
        $content.animate({left:-Game.GameWidth, opacity:0}, slideTime);
      } else {
        // select first menu item
        $menu.find('li').removeClass('selected').first().addClass('selected');

        $screen.show();
        $screen.animate({opacity:1}, slideTime);
        $content.animate({left:0, opacity:1}, slideTime);
      }
    }
  }).subscribe('game over', function () {
    $('#resume-game').hide();
    $screen.removeClass('pause');
    // cross fade effect
    $content.css({left: '0px', opacity:1});
    window.setTimeout(function () {
      $screen.show();
      $screen.animate({opacity:1}, 2000);
    }, 7000);

  }).subscribe('up', function () {
    var prev = $menu.find('.selected').removeClass('selected').prevAll('li:visible').first();
    if (!prev.length) {
      prev = $menu.find('li:visible:last');
    }
    prev.addClass('selected');
  }).subscribe('down', function () {
    var next = $menu.find('.selected').removeClass('selected').nextAll('li:visible').first();
    if (!next.length) {
      next = $menu.find('li:visible:first');
    }
    next.addClass('selected');
  }).subscribe('select', function () {
    if ($screen.is(':visible')) {
      // so hover selected things activate first
      var $hover = $menu.find('li:hover');
      if ($hover.length) {
        $hover.click();
      } else {
        $menu.find('li.selected').click();
      }
    }
  });
});
