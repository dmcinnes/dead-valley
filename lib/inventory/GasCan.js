// GasCan

define(['Game', 'inventory/InventoryItem', 'Fuel'],
       function (Game, InventoryItem, Fuel) {

  var FUELING_RATE  = 0.3; // gallons per second
  var FUEL_CAPACITY = 5;   // gallons

  var $container = $('#container');

  var GasCan = function () {
    this.currentFuel = 0;
    this.subscribe('fuel level updated', this.updateDisplay, this);
    this.subscribe('fuel transferred', this.updateDisplay, this);
  };

  GasCan.prototype = {
    use: function () {
      if (this.currentFuel > 0) {
	window.setTimeout(function () {
	  $container.addClass('gascan');
	}, 0);
	this.activate();
      }
    },

    displayNode: function () {
      if (!this.display) {
        this.display = $("<div/>")
          .addClass('gascan')
          .append($("<span/>").addClass('readout'))
          .append($("<img/>").attr('src', this.image).attr('title', this.description));
        this.updateDisplay();
      }
      return this.display;
    },

    updateDisplay: function () {
      if (this.display) {
        var value = Math.round(this.currentFuel * 10) / 10;
        this.display.find('.readout').text(value + " Gal.");
      }
    },

    saveMetadata: function () {
      return {
        currentFuel: this.currentFuel
      };
    },

    isCarCloseEnough: function (car) {
      // can only fuel cars if we're touching them
      return _.include(Game.dude.touching, car);
    },

    fuelCapacity: FUEL_CAPACITY
  };

  InventoryItem(GasCan, {
    width:  2, 
    height: 3, 
    image:  'gascan',
    clazz:  'GasCan',
    description: 'Gas Can',
    dropScale: 0.2
  });

  Fuel.receiver(GasCan);
  Fuel.giver(GasCan, FUELING_RATE);

  Game.events.subscribe('fuel source active', function () {
    $('.gascan').draggable('disable');
    GasCan.prototype.movable = false;
  }).subscribe('fuel source inactive', function () {
    $('.gascan').draggable('enable');
    GasCan.prototype.movable = true;
  }).subscribe('mouseup', function (event, clickedSprite) {
    $container.removeClass('gascan');
    if (Fuel.activePump && Fuel.activePump.clazz === 'GasCan') {
      Fuel.activePump.stopFueling();
      Fuel.activePump.deactivate();
    }
  });

  $('.inventory-item.gascan img').live('mousedown', function (e) {
    if (Fuel.activePump) {
      var gascan = InventoryItem.getInventoryItemFromEvent(e);
      Fuel.activePump.startFueling(gascan);
    }
  });

  return GasCan;
});
