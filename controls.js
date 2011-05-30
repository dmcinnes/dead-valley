define(function () {
  // TODO generate all alpha key codes
  var KEY_CODES = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  var keyStatus = { keyDown:false };
  for (code in KEY_CODES) {
    keyStatus[KEY_CODES[code]] = false;
  }

  // set up the structure for handling key presses
  var setupKeyStatus = function (key) {
    var lower = key.toLowerCase();
    var code = lower.charCodeAt(0);
    KEY_CODES[code] = lower;
    keyStatus[lower] = false;

    code = key.toUpperCase().charCodeAt(0);
    KEY_CODES[code] = lower;
    keyStatus[lower] = false;
  };

  var downHandlers = {};
  var upHandlers = {};

  $(window).keydown(function (e) {
    keyStatus.keyDown = true;
    var key = KEY_CODES[e.keyCode];
    if (key) {
      e.preventDefault();
      keyStatus[key] = true;
      fireKeyHandlers(key, downHandlers);
    }
  }).keyup(function (e) {
    keyStatus.keyDown = false;
    var key = KEY_CODES[e.keyCode];
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
    setupKeyStatus(key);
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
