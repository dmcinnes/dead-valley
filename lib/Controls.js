define(['Game', 'MainLoop', 'Keyboard', 'World'], function (Game, MainLoop, Keyboard, World) {

  var keys = {
    i:      'toggle inventory',
    esc:    'hide inventory',
    f:      'toggle framerate',
    p:      'toggle pause',
    e:      'dude enter/exit',
    h:      'dude toggle headlights',
    r:      'reload',
    x:      'eject ammo',
    space:  'space',
    up:     'up',
    down:   'down',
    return: 'select'
  };

  _.each(keys, function (value, key) {
    Keyboard.registerKeyDownHandler(key, function (e) {
      if (!MainLoop.isPaused() || key === 'p') { // only allow to get unpaused
        Game.events.fireEvent(value, e);
      }
    });
  });

});
