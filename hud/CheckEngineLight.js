// check engine light
define(['Game'], function (Game) {

  var light      = $("#check-engine-light");
  var interval   = 0.4; // in seconds
  var currentCar = null;
  var lit        = false;
  var visible    = false;
  var counter    = 0;

  var update = function (health) {
    lit = (health < 25);

    if (!lit) {
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
    }
  };

  var show = function (car) {
    registerCar(car);
    update(car.health);
    light.show();
    visible = true;
  };

  var hide = function () {
    light.hide();
    visible = false;
  };


  return {
    render: function (delta) {
    },
    run: function (delta) {
      if (visible && lit) {
        counter += delta;
        if (counter > interval) {
          counter = 0;
          light.toggleClass('lit');
        }
      }
    },
    z: Number.MAX_VALUE,
    update: update,
    show: show,
    hide: hide
  };
});
