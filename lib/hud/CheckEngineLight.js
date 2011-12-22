// check engine light
define(['Game'], function (Game) {

  var light      = $("#check-engine-light");
  var interval   = 0.5; // in seconds
  var currentCar = null;
  var lit        = false;
  var visible    = false;
  var counter    = 0;

  var update = function (health) {
    lit = (health < 15 && health > 0);

    if (lit) {
      show();
    } else {
      light.removeClass('lit');
    }
  };

  var registerCar = function (car) {
    if (car !== currentCar) {
      if (currentCar) {
        currentCar.unsubscribe('health changed', update);
      }
      currentCar = car;
      currentCar.subscribe('health changed', update);
      update(car.health);
    }
  };

  var unregisterCar = function () {
    if (currentCar) {
      currentCar.unsubscribe('health changed', update);
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
