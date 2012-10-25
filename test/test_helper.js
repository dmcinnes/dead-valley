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
