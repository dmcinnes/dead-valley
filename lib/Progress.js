// Progress Bar

define([], function () {
  
  var container = $('#progress');
  var slider    = $('#progress-slider');

  var total = 100;
  var current = 0;

  var callback = null;

  var updateSlider = function () {
    slider.width(Math.round(100 * current / total) + '%');
    if (current >= total) {
      // so we can see it complete before it disappears
      window.setTimeout(function () {
        container.hide();
      }, 300);
      callback && callback();
    }
  };

  return {
    setTotal: function (newTotal, cb) {
      callback = cb;
      current = 0;
      total = newTotal;
      updateSlider();
      container.show();
    },

    increment: function (value) {
      current = current + (value || 1);
      updateSlider();
      return current;
    },

    current: function () {
      return current;
    },

    done: function () {
      return current >= total;
    },

    // take an array of calls and execute them serially
    // last function is the final callback
    run: function (/* functions */) {
      var self = this;

      var calls = _.toArray(arguments);

      // the last function is an argument
      this.setTotal(calls.length - 1);

      var func = function (calls) {
        if (calls.length) {
          var first = calls.shift();
          first(function () {
            self.increment();
            func(calls);
          });
        }
      };

      func(calls);
    }
  };
});

