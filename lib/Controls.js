define(['Game', 'MainLoop', 'Keyboard', 'World'], function (Game, MainLoop, Keyboard, World) {

  var gameKeys = {
    i:      'toggle inventory',
    f:      'toggle framerate',
    e:      'dude enter/exit',
    h:      'dude toggle headlights',
    r:      'reload',
    x:      'eject ammo',
    space:  'space'
  };

  var mainControlKeys = {
    esc:    'esc',
    p:      'esc',
    up:     'up',
    down:   'down',
    return: 'select'
  };

  // only run when not paused
  _.each(gameKeys, function (value, key) {
    Keyboard.registerKeyDownHandler(key, function (e) {
      if (!MainLoop.isPaused()) {
        Game.events.fireEvent(value, e);
      }
    });
  });

  // run always
  _.each(mainControlKeys, function (value, key) {
    Keyboard.registerKeyDownHandler(key, function (e) {
      Game.events.fireEvent(value, e);
    });
  });

});
