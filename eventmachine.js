// simple pub/sub scheme for objects
define(function () {

  var subscribe = function (eventName, callback) {
    if (!this._eventHandlers) {
      this._eventHandlers = {};
    }
    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = [];
    }
    this._eventHandlers[eventName].push(callback);
  };

  var unsubscribe = function (eventName, callback) {
    if (this._eventHandlers) {
      var handlers = this._eventHandlers[eventName];
      if (handlers) {
        this._eventHandlers[eventName] = _.without(handlers, callback);
      }
    }
  };

  // fire the given event -- extra args gets passed to callback
  var fireEvent = function (eventName) {
    if (this._eventHandlers) {
      var handlers = this._eventHandlers[eventName];
      if (handlers) {
        var args = _.tail(arguments);
        _.invoke(handlers, 'apply', this, args);
      }
    }
  };

  var eventMachine = function (Thing) {
    // create a blank object if we're not given one
    Thing = Thing || {};

    // if Thing has a prototype use that
    var object = Thing.prototype ? Thing.prototype : Thing;

    object.subscribe   = subscribe;
    object.unsubscribe = unsubscribe;
    object.fireEvent   = fireEvent;

    return Thing;
  };

  return eventMachine;
});
