define(function () {
  // TODO generate all alpha key codes
  var KEY_CODES = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    70: 'f',
    71: 'g',
    72: 'h',
    77: 'm',
    78: 'n',
    80: 'p',
    88: 'x'
  };

  var keyStatus = { keyDown:false };
  for (code in KEY_CODES) {
    keyStatus[KEY_CODES[code]] = false;
  }

  var downHandlers = {};
  var upHandlers = {};

  var key;
  $(window).keydown(function (e) {
    keyStatus.keyDown = true;
    key = KEY_CODES[e.keyCode];
    if (key) {
      e.preventDefault();
      keyStatus[key] = true;
      fireKeyHandlers(key, downHandlers);
    }
  }).keyup(function (e) {
    keyStatus.keyDown = false;
    key = KEY_CODES[e.keyCode];
    if (key) {
      e.preventDefault();
      keyStatus[key] = false;
      fireKeyHandlers(key, upHandlers);
    }
  });

  var fireKeyHandlers = function (key, handlers) {
    if (handlers[key]) {
      _(handlers[key]).each(function (handler) {
        handler();
      });
    }
  };

  var registerKeyDownHandler = function (key, callback) {
    var handlers = downHandlers[key];
    if (!handlers) {
      downHandlers[key] = handlers = [];
    }
    handlers.push(callback);
  };

  return {
    keyStatus: keyStatus,
    registerKeyDownHandler: registerKeyDownHandler
  };
});
