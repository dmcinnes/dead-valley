define(['Game', 'inventory/InventoryItem', 'Fuel'],
       function (Game, InventoryItem, Fuel) {

  var FUELING_RATE  = 0.2; // gallons per second
  var FUELING_DISTANCE = 40;

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
        Game.events.fireEvent('fuel source active', this);
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
      return Game.dude.distance(car) < FUELING_DISTANCE;
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

  Game.events.subscribe('mouseup', function (event, clickedSprite) {
    $container.removeClass('rubber-tubing');
    if (Fuel.activePump && Fuel.activePump.clazz === 'RubberTubing') {
      Fuel.activePump.complete();
    }
  });

  return RubberTubing;
});
