define(['game', 'mainloop', 'Keyboard'], function (game, mainloop, Keyboard) {

  var keys = {
    i:   'toggle inventory',
    esc: 'hide inventory',
    f:   'toggle framerate',
    p:   'toggle pause',
    n:   'transition sky',
    x:   'dude enter/exit',
    h:   'dude toggle headlights',
    r:   'reload'
  };

  _.each(keys, function (value, key) {
    Keyboard.registerKeyDownHandler(key, function (e) {
      if (!mainloop.isPaused() || key === 'p') { // only allow to get unpaused
        game.events.fireEvent(value, e);
      }
    });
  });

});
