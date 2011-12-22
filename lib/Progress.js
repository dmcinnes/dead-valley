// Progress Bar

define([], function () {
  
  var container = $('#progress');
  var slider    = $('#progress-slider');

  var total = 100;
  var current = 0;

  var callback = null;

  var updateSlider = function () {
    slider.width((100 * current / total) + '%');
    if (current >= total) {
      container.hide();
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
    }
  };
});

