define(['game'], function (game) {

  var div = $('#fuel-gauge');

  var context = div[0].getContext("2d");

  var width  = div.width();
  var height = div.height();

  var length     = 50;
  var hw         = 2;
  var tip        = 2;
  var roundThing = 8;

  var displayedAngle = 0;
  var angle = 0;

  var updateAngle = function (car) {
    angle = Math.PI * car.percentFuelRemaining();
  };

  var clear = function () {
    context.clearRect(0, 0, width, height);
  };

  var render = function () {
    displayedAngle = angle;
    clear();

    context.save();
    context.translate(width/2, height);
    context.arc(0, 0, roundThing, 0, Math.PI/2, true);
    context.fill();
    context.rotate(-angle);
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

  var update = function (car) {
    updateAngle(car);
    render();
  };

  var show = function (car) {
    if (car) {
      updateAngle(car);
      render();
    }
    div.show();
  };

  var hide = function () {
    div.hide();
  };

  game.events.subscribe('fuel consumed', function (car) {
    updateAngle(car);
    if (displayedAngle - angle > 0.01) { // less than 1 degree
      render();
    }
  });

  return {
    update: update,
    render: render,
    clear: clear,
    show: show,
    hide: hide
  };
});
