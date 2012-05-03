// Progress Bar

define(['Console'], function (Console) {
  
  var container = $('#progress');
  var slider    = $('#progress-slider');

  var started = false;
  var done    = false;

  var ducks = {
    start: false,
    map:   false,
    audio: false
  };

  var total   = 0;
  var current = 0;

  var callback;

  var functions = [];

  var updateSlider = function () {
    slider.width(Math.round(100 * current / total) + '%');
    if (current >= total) {
      current = 0;
      total   = 0;
      // so we can see it complete before it disappears
      window.setTimeout(function () {
        container.hide();
      }, 300);
    }
  };

  var start = function () {
    // if all the ducks are in a row
    if (_.all(ducks, _.identity)) {
      Console.log('Progress starting...', total);
      updateSlider();
      container.show();
      _.each(functions, function (func) {
        func();
      });
    }
  };

  return {
    onStart: function (func, count) {
      if (started) {
        func();
      } else {
        total += (count || 1);
        functions.push(func);
      }
    },

    addMapWorkerProgress: function (count) {
      total = total + count;
      ducks.map = true;
      start();
    },

    audioLoaded: function () {
      ducks.audio = true;
      start();
    },

    start: function (cb) {
      callback = cb;
      ducks.start = true;
      start();
    },

    increment: function (value) {
      current = current + (value || 1);
      updateSlider();
      if (current === total) {
        done = true;
        Console.log('Progress complete.');
        callback();
      }
      return current;
    },

    // take an array of calls and execute them serially
    // last function is the final callback
    runSerial: function (/* functions */) {
      var calls = _.toArray(arguments);

      var func = function () {
        if (calls.length) {
          var first = calls.shift();
          first(func);
        }
      };

      func();
    },

    runParallel: function (/* functions, callback */) {
      var calls = _.toArray(arguments);
      var callback = calls.pop();
      var count = calls.length;

      _.invoke(calls, function () {
        count--;
        if (count === 0) {
          callback();
        }
      });
    }

  };
});

