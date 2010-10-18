define(function () {

  var node = $('#framerate');
  var visible = true;

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

    show: function () {
      frameCount = 0;
      elapsedCounter = 0.0;
      visible = true;
      node.show();
    },

    hide: function () {
      visible = false;
      node.hide();
    },

    isShowing: function () {
      return visible;
    }
  };
});
