define(['Game', 'hud/Overlay'], function (Game, Overlay) {
  var $screen  = $('#main-screen');
  var $content = $('#main-content');
  var $help    = $('#help');
  var $menu    = $('#menu');
  var $graphic = $('#graphic');
  var $title   = $('#title');

  var sliding = false;

  var slideTime = 500;

  Overlay($screen);

  if (Game.hasSavedGame()) {
    $('#resume-game').addClass('selected').show();
  } else {
    $('#new-game').addClass('selected');
  }

  var toggleHelp = function () {
    if (!sliding) {
      sliding = true;
      if ($screen.is(':visible')) {
        $help.css('top', Game.GameHeight).show();
        $screen.animate({top:-Game.GameHeight}, {duration:slideTime, queue:false, complete:function () {
          $screen.hide();
          sliding = false;
        }});
        $help.animate({top:0}, {duration:slideTime, queue:false});
      } else {
        $screen.show();
        $screen.animate({top:0}, {duration:slideTime, queue:false});
        $help.animate({top:Game.GameHeight}, {duration:slideTime, queue:false, complete:function () {
          $help.hide();
          sliding = false;
        }});
      }
    }
  };

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
    instructions: function () {
      toggleHelp();
    },
    toggleSound: function () {
      Game.events.fireEvent('toggle sound');
    }
  };

  $('#new-game').click(Menu.newGame);
  $('#time-challenge').click(Menu.timeChallenge);
  $('#resume-game').click(Menu.resumeGame);
  $('#instructions').click(Menu.instructions);
  $('#sound').click(Menu.toggleSound);

  Game.events.subscribe('everything loaded', function () {
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
    });
    $content.animate({left:-Game.GameWidth, opacity:0}, slideTime);

  }).subscribe('esc', function () {
    if ($help.is(':visible')) {
      toggleHelp();
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
    $screen.show();
    $screen.animate({opacity:1}, 2000, function () {
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
    } else if ($help.is(':visible')) {
      toggleHelp();
    }
  }).subscribe('audio state changed', function (enabled) {
    var selector = enabled ? ':first' : ':last';
    $('#sound .choice span').removeClass('on').filter(selector).addClass('on');
  });

  $help.find('.back').click(toggleHelp);
});
