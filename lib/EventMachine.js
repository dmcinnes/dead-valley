// simple pub/sub scheme for objects
define([], function () {

  var subscribe = function (eventName, callback, thisObject) {
    if (!this._eventHandlers) {
      this._eventHandlers = {};
    }

    // handle multiple event names separated by a comma
    _.each(eventName.split(','), function (name) {
      if (!this._eventHandlers[name]) {
        this._eventHandlers[name] = [];
      }
      this._eventHandlers[name].push({
        callback:   callback,
        thisObject: thisObject
      });
    }, this);

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

    object.subscribe     = subscribe;
    object.unsubscribe   = unsubscribe;
    object.fireEvent     = fireEvent;
    object.waitForEvents = waitForEvents;

    return Thing;
  };

  return EventMachine;
});
