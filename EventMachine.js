// simple pub/sub scheme for objects
define(function () {

  var subscribe = function (eventName, callback, thisObject) {
    if (!this._eventHandlers) {
      this._eventHandlers = {};
    }
    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = [];
    }
    this._eventHandlers[eventName].push({
      callback:   callback,
      thisObject: thisObject
    });

    return this; // for chaining
  };

  var unsubscribe = function (eventName, callback) {
    if (this._eventHandlers) {
      var handlers = this._eventHandlers[eventName];
      if (handlers) {
        this._eventHandlers[eventName] = _.reject(handlers, function (handler) {
          return handler.callback === callback;
        });
      }
    }

    return this; // for chaining
  };

  // fire the given event -- extra args gets passed to callback
  var fireEvent = function (eventName) {
    if (this._eventHandlers) {
      var handlers = this._eventHandlers[eventName];
      if (handlers) {
        var args = _.tail(arguments);
        _.each(handlers, function (handler) {
          handler.callback.apply(handler.thisObject || this, args);
        });
      }
    }

    return this; // for chaining
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
