define(['game', 'mainloop', 'Keyboard', 'World'], function (game, mainloop, Keyboard, World) {

  var keys = {
    i:     'toggle inventory',
    esc:   'hide inventory',
    f:     'toggle framerate',
    p:     'toggle pause',
    n:     'transition sky',
    e:     'dude enter/exit',
    h:     'dude toggle headlights',
    r:     'reload',
    x:     'eject ammo',
    space: 'space'
  };

  _.each(keys, function (value, key) {
    Keyboard.registerKeyDownHandler(key, function (e) {
      if (!mainloop.isPaused() || key === 'p') { // only allow to get unpaused
        game.events.fireEvent(value, e);
      }
    });
  });

});
