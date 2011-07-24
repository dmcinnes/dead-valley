define(['game'], function (game) {

  var div = $('#fuel-gauge');
  var needle = $('#fuel-gauge-needle');

  var width  = div.width();
  var height = div.height();

  var angleWidth = 120;
  var verticalOffset = 60;

  var displayedAngle = 0;
  var angle = 0;

  var updateAngle = function (car) {
    angle = angleWidth * car.percentFuelRemaining() - verticalOffset;
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

  game.events.subscribe('fuel level updated', function (car) {
    updateAngle(car);
  });

  return {
    update: updateAngle,
    show: show,
    hide: hide
  };
});
