define(['Game', 'Reporter', 'hud/Overlay'], function (Game, Reporter) {
  var $screen  = $('#main-screen');
  var $content = $('#main-content');
  var $help    = $('#help');
  var $about   = $('#about-screen');
  var $menu    = $('#menu');
  var $graphic = $('#graphic');
  var $title   = $('#title');
  var $stats   = $('#stats-screen');

  var sliding = false;

  var slideTime = 500;

  if (Game.hasSavedGame()) {
    $('#resume-game').addClass('selected').show();
  } else {
    $('#new-game').addClass('selected');
  }

  // create a function that slide toggles the given page
  var textScreenToggler = function ($toToggle, direction, name) {
    var toX  = 0;
    var froX = 0;
    var toY  = 0;
    var froY = 0;
    switch (direction) {
      case 'up':
        toY = Game.GameHeight;
        break;
      case 'down':
        toY = -Game.GameHeight;
        break;
      case 'left':
        toX = -Game.GameWidth;
        break;
      case 'right':
        toX = Game.GameWidth;
        break;
    }
    froX = -toX;
    froY = -toY;
    return function () {
      if (!sliding) {
        sliding = true;
        if ($screen.is(':visible')) {
          $toToggle.css({
            top: froY,
            left: froX
          }).show();
          $screen.animate({top:toY, left:toX},
                          {duration:slideTime, queue:false, complete:function () {
            $screen.hide();
            sliding = false;
          }});
          $toToggle.animate({top:0, left:0}, {duration:slideTime, queue:false});
          Game.events.fireEvent('showing screen', name);
        } else {
          $screen.css({
            top: toY,
            left: toX
          }).show();
          $screen.animate({top:0, left:0}, {duration:slideTime, queue:false});
          $toToggle.animate({top:froY, left:froX}, {duration:slideTime, queue:false, complete:function () {
            $toToggle.hide();
            sliding = false;
          }});
          Game.events.fireEvent('hiding screen', name);
        }
      }
    };
  };

  var escapeTextScreen = function () {
    if ($help.is(':visible')) {
      toggleHelp();
    } else if ($about.is(':visible')) {
      toggleAbout();
    } else if ($stats.is(':visible')) {
      toggleStats();
    }
  };

  var toggleHelp  = textScreenToggler($help,  'down',  'help');
  var toggleAbout = textScreenToggler($about, 'up',    'about');
  var toggleStats = textScreenToggler($stats, 'right', 'stats');

  var toggleMain = function () {
    if (!sliding) {
      sliding = true;
      if ($screen.is(':visible')) {
        $screen.animate({opacity:0}, slideTime, function () {
          $screen.hide();
          sliding = false;
          Game.events.fireEvent('toggle pause');
        });
        $content.animate({left:-Game.GameWidth, opacity:0}, slideTime);
      } else {
        // pause first
        Game.events.fireEvent('toggle pause');

        // select first menu item
        $menu.find('li').removeClass('selected').first().addClass('selected');

        $screen.addClass('pause');
        $screen.show();

        $screen.animate({opacity:1}, slideTime);
        $content.animate({left:0, opacity:1}, slideTime, function () {
          sliding = false;
        });
      }
    }
  };

  var Menu = {
    newGame: function () {
      Game.newGame();
    },
    timeChallenge: function () {
      Game.newGame(true);
    },
    resumeGame: function () {
      if (Game.isOver) {
        Game.loadSavedGame();
      } else {
        toggleMain();
      }
    },
    instructions: toggleHelp,
    about: toggleAbout,
    stats: toggleStats,
    toggleSound: function () {
      Game.events.fireEvent('toggle sound');
    }
  };

  $('#new-game').click(Menu.newGame);
  $('#time-challenge').click(Menu.timeChallenge);
  $('#resume-game').click(Menu.resumeGame);
  $('#stats').click(Menu.stats);
  $('#instructions').click(Menu.instructions);
  $('#about').click(Menu.about);
  $('#sound').click(Menu.toggleSound);

  Game.events.subscribe('everything loaded', function () {
    if (!Reporter.counters()) {
      $('#stats').hide();
    }

    $screen.fadeIn(2000, function () {
      Game.events.fireEvent('main screen loaded');
    });

  }).subscribe('game start', function () {
    $screen.animate({opacity:0}, slideTime, function () {
      $screen.hide();
      $title.hide();
      $graphic.hide();
      $menu.addClass('center');
      $('#resume-game').show();
      $('#stats').show();
    });
    $content.animate({left:-Game.GameWidth, opacity:0}, slideTime);

  }).subscribe('esc', function () {
    if ($('.text-content').is(':visible')) {
      escapeTextScreen();
    } else if (!Game.isOver) {
      toggleMain();
    }
  }).subscribe('game over complete', function () {
    $('#resume-game').hide();

    $title.show();
    $graphic.show();
    $menu.removeClass('center');

    $screen.removeClass('pause');
    $content.css({left: '0px', opacity:1});

    // so we populate stats screen
    Game.events.fireEvent('showing screen', 'stats');
    $screen.css('opacity', 1);
    $stats.css({opacity: 0, left: 0});
    $stats.show();
    $stats.animate({opacity:1}, 2000, function () {
      Game.events.fireEvent('stop game');
    });

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
    } else if ($('.text-content').is(':visible')) {
      escapeTextScreen();
    }
  }).subscribe('audio state changed', function (enabled) {
    var selector = enabled ? ':first' : ':last';
    $('#sound .choice span').removeClass('on').filter(selector).addClass('on');
  });

  $('#container').find('.back').click(escapeTextScreen);

  // make all the about links open in a new window
  $('#about-screen').find('a').attr('target', '_blank');
});
