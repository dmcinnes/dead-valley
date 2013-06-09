define(['Game', 'inventory/InventoryItem', 'Fuel'],
       function (Game, InventoryItem, Fuel) {

  var FUELING_RATE  = 0.2; // gallons per second
  var FUELING_DISTANCE = 50;

  var $container = $('#container');

  var RubberTubing = function () {
  };

  RubberTubing.prototype = {
    use: function () {
      var car = _.detect(Game.dude.touching, function (sprite) {
        return sprite.isCar;
      });
      if (car && car.currentFuel) {
        this.source = car;
        this.currentFuel = car.currentFuel;
        window.setTimeout(function () {
          $container.addClass('rubber-tubing');
        }, 0);
        this.activate();
      }
    },
    complete: function () {
      this.stopFueling();
      this.deactivate();
      var change = this.source.currentFuel - this.currentFuel;
      this.source.currentFuel = this.currentFuel;
      if (change) {
        this.source.fireEvent('fuel level updated', change);
      }
      this.currentFuel = null;
      this.source = null;
      $container.removeClass('rubber-tubing');
    },
    isCarCloseEnough: function (car) {
      return this.source !== car &&
             Game.dude.distance(car) < FUELING_DISTANCE;
    }
  };

  InventoryItem(RubberTubing, {
    width:  1, 
    height: 1, 
    image:  'rubber-tubing',
    clazz:  'RubberTubing',
    description: 'Rubber Tubing (Siphon)'
  });

  Fuel.giver(RubberTubing, FUELING_RATE);

  var finish = function () {
    $container.removeClass('rubber-tubing');
    if (Fuel.activePump && Fuel.activePump.clazz === 'RubberTubing') {
      Fuel.activePump.complete();
    }
  };

  // finish when the mouseup event is triggered on the mouse overlay
  Game.events.subscribe('mouseup', finish);

  // finish when the mouseup event is triggered on inventory
  // but only when rubber-tubing is actively fueling someone
  $('.inventory').live('mouseup', function (e) {
    if (Fuel.activePump &&
        Fuel.activePump.clazz === 'RubberTubing' &&
        Fuel.activePump.fueling) {
      finish();
    }
  });

  // deactivate when stop touching car
  Game.events.subscribe('new dude', function (dude) {
    dude.subscribe('stopped touching', function (what) {
      if (Fuel.activePump &&
          Fuel.activePump.clazz === 'RubberTubing' &&
          Fuel.activePump.source === what) {
        finish();
      }
    });
  });

  return RubberTubing;
});
