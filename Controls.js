define(['game', 'Keyboard'], function (game, Keyboard) {

  var keys = {
    i:   'toggle inventory',
    esc: 'hide inventory',
    f:   'toggle framerate',
    p:   'toggle pause',
    n:   'transition sky',
    x:   'dude enter/exit',
    h:   'dude toggle headlights'
  };

  _.each(keys, function (value, key) {
    Keyboard.registerKeyDownHandler(key, function (e) {
      game.events.fireEvent(value, e);
    });
  });

});
