define(['game'], function (game) {

  var context = game.spriteContext;
  var x = game.canvasWidth - 38;
  var y = game.canvasHeight - 2;

  var avgFramerate   = 0;
  var frameCount     = 0;
  var elapsedCounter = 0;

  var render = function () {
    context.save();
    context.fillStyle = 'green';
    context.fillText(''+avgFramerate, x, y);
    context.restore();
  };

  return {
    run: function (delta) {
      if (this.show) render();

      frameCount++;
      elapsedCounter += delta;
      if (elapsedCounter > 1.0) {
        elapsedCounter -= 1.0;
        avgFramerate = frameCount;
        frameCount = 0;
      }
    },

    show: true
  };
});
