define(['game'], function (game) {

  var context = game.hudContext;

  var length     = 100;
  var hw         = 5;
  var tip        = 3;
  var roundThing = 15;

  var calculateMPH = function (car) {
    return Math.round(car.vel.magnitude() * 14400 / 63360);
  };

  var calculateAngle = function (car) {
    return Math.PI * calculateMPH(car) / 240;
  };

  var clear = function () {
    context.clearRect(0, game.canvasHeight - length, length, length);
  };

  var render = function (car) {
    clear();

    context.save();
    context.translate(0, game.canvasHeight);
    context.arc(0, 0, roundThing, 0, Math.PI/4, true);
    context.fill();
    context.rotate(-calculateAngle(car));
    context.beginPath();
    context.moveTo(0, hw);
    context.lineTo(length - tip, tip);
    context.lineTo(length, 0);
    context.lineTo(length - tip, -tip);
    context.lineTo(0, -hw);
    context.lineTo(0, hw);
    context.fill();
    context.restore();
  };

  return {
    render: render,
    clear: clear,
    z: Number.MAX_VALUE
  };
});
