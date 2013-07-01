define(['Game'], function (Game) {

  var node = $('#framerate');
  var visible = $('#framerate').hasClass('active');

  var frameCount     = 0;
  var elapsedCounter = 0.0;

  var render = function (framerate) {
    node.text(framerate + ' FPS');
  };

  var show = function () {
    frameCount = 0;
    elapsedCounter = 0.0;
    visible = true;
    node.addClass('active');
    render(0);
  };

  var hide = function () {
    visible = false;
    node.removeClass('active');
  };

  Game.events.subscribe('toggle framerate', function () {
    if (visible) {
      hide();
    } else {
      show();
    }
  });

  var Framerate = {
    tick: function (delta) {
      if (visible) {
        frameCount++;
        elapsedCounter += delta;
        if (elapsedCounter > 1.0) {
          elapsedCounter -= 1.0;
          render(frameCount);
          frameCount = 0;
        }
      }
    }
  };

  Game.registerObjectForDeltaUpdates(Framerate);

  return Framerate;
});
