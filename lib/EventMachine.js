// simple pub/sub scheme for objects
define([], function () {

  var _addHandler = function (eventName, handler) {
    if (!this._eventHandlers) {
      this._eventHandlers = {};
    }

    // handle multiple event names separated by a comma
    _.each(eventName.split(','), function (name) {
      if (!this._eventHandlers[name]) {
        this._eventHandlers[name] = [];
      }
      this._eventHandlers[name].push(handler);
    }, this);
  };

  var subscribe = function (eventName, callback, thisObject) {

    this._addHandler(eventName, {
      callback:   callback,
      thisObject: thisObject
    });

    return this; // for chaining
  };

  var once = function (eventName, callback, thisObject) {

    this._addHandler(eventName, {
      callback:   callback,
      thisObject: thisObject,
      once:       true
    });

    return this; // for chaining
  };

  var unsubscribe = function (eventName, callback) {
    var handlers = this._eventHandlers && this._eventHandlers[eventName];
    if (handlers) {
      this._eventHandlers[eventName] = _.reject(handlers, function (handler) {
        return handler.callback === callback;
      });
    }

    return this; // for chaining
  };

  // fire the given event -- extra args gets passed to callback
  var fireEvent = function (eventName) {
    var handlers = this._eventHandlers && this._eventHandlers[eventName];
    if (handlers) {
      var args = _.tail(arguments);
      var length = handlers.length;
      for (var i = 0; i < length; i++) {
        var handler = handlers[i];
        handler.callback.apply(handler.thisObject || this, args);
        if (handler.once) {
          handlers.splice(i, 1);
          i--;
          length--;
        }
      }
    }

    return this; // for chaining
  };

  // takes a list of event keys and a callback
  // calls the callback only after all of the events have
  // been fired.
  var waitForEvents = function () {
    var self     = this;
    var events   = _.toArray(arguments);
    var callback = events.pop(); // callback is last argument
    var count    = 0;

    _.each(events, function (event) {
      var intermediary = function () {
        count++;
        self.unsubscribe(event, intermediary);
        if (count === events.length) {
          callback();
        }
      };
      self.subscribe(event, intermediary);
    });
  };


  var EventMachine = function (Thing) {
    // create a blank object if we're not given one
    Thing = Thing || {};

    // if Thing has a prototype use that
    var object = Thing.prototype ? Thing.prototype : Thing;

    object._addHandler   = _addHandler;
    object.subscribe     = subscribe;
    object.unsubscribe   = unsubscribe;
    object.fireEvent     = fireEvent;
    object.waitForEvents = waitForEvents;
    object.once          = once;

    return Thing;
  };

  return EventMachine;
});
