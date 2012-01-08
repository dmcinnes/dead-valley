// low fuel light
define(['Game'], function (Game) {

  var light      = $("#low-fuel-light");
  var interval   = 1.2; // in seconds
  var currentCar = null;
  var lit        = false;
  var visible    = false;
  var counter    = 0;

  var update = function () {
    var fuel = currentCar.currentFuel;
    lit = (fuel < 0.25);

    if (lit) {
      show();
    } else {
      hide();
    }
  };

  var registerCar = function (car) {
    if (car !== currentCar) {
      if (currentCar) {
        currentCar.unsubscribe('fuel level updated', update);
      }
      currentCar = car;
      currentCar.subscribe('fuel level updated', update);
      update();
      light.addClass('lit');
    }
  };

  var unregisterCar = function () {
    if (currentCar) {
      currentCar.unsubscribe('fuel level updated', update);
      currentCar = null;
    }
    lit = false;
    hide();
  };

  var show = function (car) {
    light.show();
    visible = true;
  };

  var hide = function () {
    light.hide();
    visible = false;
  };

  Game.events.subscribe('new dude', function (dude) {
    dude.subscribe('entered car', registerCar);
    dude.subscribe('left car', unregisterCar);
  });

  return {
    preMove: function (delta) {
      if (visible && lit) {
        counter += delta;
        if (counter > interval) {
          counter = 0;
          light.toggleClass('lit');
        }
      }
    },
    z: Number.MAX_VALUE,
    visible: true,
    show: show,
    hide: hide
  };
});
