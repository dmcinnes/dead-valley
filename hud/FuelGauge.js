define(['Game'], function (Game) {

  var div = $('#fuel-gauge');
  var needle = $('#fuel-gauge-needle');

  var width  = div.width();
  var height = div.height();

  var angleWidth = 120;
  var verticalOffset = 60;

  var displayedAngle = 0;
  var angle = 0;

  var currentCar = null;

  var updateAngle = function () {
    angle = angleWidth * currentCar.percentFuelRemaining() - verticalOffset;
    if (Math.abs(displayedAngle - angle) > 1) {
      displayedAngle = angle;
      needle.transform({rotate:displayedAngle+"deg"});
    }
  };

  var show = function (car) {
    if (car) {
      currentCar = car;
    }
    div.show();
  };

  var hide = function () {
    div.hide();
    if (currentCar) {
      currentCar = null;
    }
  };

  var registerCar = function (car) {
    if (car !== currentCar) {
      if (currentCar) {
        currentCar.unsubscribe('fuel level updated', updateAngle);
      }
      currentCar = car;
      car.subscribe('fuel level updated', updateAngle);
      updateAngle();
    }
  };

  Game.events.subscribe('enter car', registerCar);

  return {
    update: updateAngle,
    show: show,
    hide: hide
  };
});
