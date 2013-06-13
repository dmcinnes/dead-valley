define([], function () {

  var setAfter = function (variable, value, countdown) {
    if (!this.timeouts) {
      this.timeouts       = {};
      this.timeoutsValues = {};
    }
    this.timeouts[variable]       = countdown;
    this.timeoutsValues[variable] = value;
  };

  var setFalseAfter = function (variable, countdown) {
    this.setAfter(variable, false, countdown);
  };

  var updateTimeouts = function (delta) {
    if (!this.timeouts) {
      return;
    }

    for (var key in this.timeouts) {
      if ((this.timeouts[key] -= delta) <= 0) {
        // complete the timeout
        this[key] = this.timeoutsValues[key];

        // remove it
        delete this.timeouts[key];
        delete this.timeoutsValues[key];
      }
    }
  };

  var Timeout = function (Thing) {
    var object = Thing.prototype ? Thing.prototype : Thing;

    object.setAfter       = setAfter;
    object.setFalseAfter  = setFalseAfter;
    object.updateTimeouts = updateTimeouts;
  };

  return Timeout;
});
