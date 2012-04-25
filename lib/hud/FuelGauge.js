define(['Game'], function (Game) {

  var transformKey = Modernizr.prefixed('transform');

  var div = $('#fuel-gauge');
  var needle = $('#fuel-gauge-needle');

  var width  = div.width();
  var height = div.height();

  var angleWidth = 120;
  var verticalOffset = 60;

  var displayedAngle = 0;
  var angle = 0;

  var active = false;

  var currentCar = null;

  var updateAngle = function () {
    angle = angleWidth * currentCar.percentFuelRemaining() - verticalOffset;
    if (Math.abs(displayedAngle - angle) > 1) {
      displayedAngle = angle;
      needle[0].style[transformKey] = "rotate(" + displayedAngle + "deg)";
    }
  };

  var show = function () {
    div.show();
  };

  var hide = function () {
    div.hide();
  };

  var registerCar = function (car) {
    if (car.isCar && car !== currentCar) {
      if (currentCar) {
        currentCar.unsubscribe('fuel level updated', updateAngle);
      }
      currentCar = car;
      car.subscribe('fuel level updated', updateAngle);
      updateAngle();
    }
  };

  Game.events.subscribe('start fueling', function (thing) {
    if (thing.isCar) {
      registerCar(thing);
      active = true;
    }
  }).subscribe('stop fueling', function (thing) {
    active = false;
  }).subscribe('enter car', registerCar);

  return {
    update: updateAngle,
    show: show,
    hide: hide,
    active: function () {
      return active;
    }
  };
});
