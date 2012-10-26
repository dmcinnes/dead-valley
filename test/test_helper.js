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

var simulateClick = function (x, y) {
  var gameX = x;
  var gameY = y;
  var event = $.Event('click');
  event.originalEvent = {
    pageX: gameX,
    pageY: gameY
  };
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

