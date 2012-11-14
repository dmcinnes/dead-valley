var Game = require('Game');

var triggerKeyEvent = function (type, key) {
  var e = jQuery.Event(type);
  e.keyCode = key.charCodeAt(0);
  $(window).trigger(e);
};

var keyDown = function (key) {
  triggerKeyEvent("keydown", key);
};

var keyUp = function (key) {
  triggerKeyEvent("keyup", key);
};

var pressKey = function (key) {
  keyDown(key);
  keyUp(key);
};

var nextFrame = function (callback) {
  waits(1);
  runs(callback);
};

var createItem = function (Thing) {
  var Clazz = require('inventory/'+Thing);
  var thing = new Clazz();
  if (thing.maxCount) {
    thing.setCount(thing.maxCount);
  }
  return thing;
};

var simulateClick = function (x, y, which) {
  var gameX = x;
  var gameY = y;
  var event = $.Event('click');
  event.originalEvent = {
    pageX: gameX,
    pageY: gameY
  };
  if (which) {
    event.which = which;
  }
  var element = document.elementFromPoint(x, y);
  $(element).trigger(event);
};

var canvasMaskOffset = $('#canvas-mask').offset();

var simulateGameClick = function (x, y) {
  simulateClick(x - canvasMaskOffset.left, y - canvasMaskOffset.top);
};

var clearSprites = function () {
  _.each(Game.sprites, function (sprite) {
    if (sprite.die && sprite !== Game.dude) {
      sprite.die();
    }
  });
};

var startNewGame = function () {
  runs(function () {
    $('#new-game').click();
  });

  var started = false;
  Game.events.once('game start', function () {
    started = true;
  });

  waitsFor(function () {
    return started;
  }, "game never started", 5000);
};

$.fn.rightClick = function () {
  this.trigger({type: 'mousedown', button: 2});
};
