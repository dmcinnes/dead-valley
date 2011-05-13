define(function () {

  var node = $('#framerate');
  var visible = $('#framerate').hasClass('active');

  var frameCount     = 0;
  var elapsedCounter = 0.0;

  var render = function (framerate) {
    node.text(framerate);
  };

  return {
    run: function (delta) {
      if (visible) {
        frameCount++;
        elapsedCounter += delta;
        if (elapsedCounter > 1.0) {
          elapsedCounter -= 1.0;
          render(frameCount);
          frameCount = 0;
        }
      }
    },

    render: function (delta) {
    },

    show: function () {
      frameCount = 0;
      elapsedCounter = 0.0;
      visible = true;
      node.addClass('active');
    },

    hide: function () {
      visible = false;
      node.removeClass('active');
    },

    isShowing: function () {
      return visible;
    },

    z: Number.MAX_VALUE
  };
});
