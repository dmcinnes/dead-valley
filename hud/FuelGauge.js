define(['game'], function (game) {

  var div = $('#fuel-gauge');
  var needle = $('#fuel-gauge-needle');

  var width  = div.width();
  var height = div.height();

  var displayedAngle = 0;
  var angle = 0;

  var updateAngle = function (car) {
    angle = 180 * car.percentFuelRemaining() - 90;
    if (Math.abs(displayedAngle - angle) > 1) {
      displayedAngle = angle;
      needle.transform({rotate:displayedAngle+"deg"});
    }
  };

  var show = function (car) {
    if (car) {
      updateAngle(car);
    }
    div.show();
  };

  var hide = function () {
    div.hide();
  };

  game.events.subscribe('fuel consumed', function (car) {
    updateAngle(car);
  });

  return {
    update: updateAngle,
    show: show,
    hide: hide
  };
});
