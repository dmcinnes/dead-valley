// GasCan

define(['Game', 'inventory/InventoryItem', 'Fuel'],
       function (Game, InventoryItem, Fuel) {

  var capacity = 255; // gallons

  var GasCan = function () {
    this.currentFuel = 0;
    this.subscribe('fuel level updated', this.updateDisplay, this);
  };

  GasCan.prototype = {
    use: function () {
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
    }
  };

  InventoryItem(GasCan, {
    width:  2, 
    height: 3, 
    image:  'gascan',
    clazz:  'GasCan',
    description: 'Gas Can'
  });

  Fuel.receiver(GasCan);

  Game.events.subscribe('fuel source active', function () {
    $('.gascan').draggable('disable');
    GasCan.prototype.movable = false;
  }).subscribe('fuel source inactive', function () {
    $('.gascan').draggable('enable');
    GasCan.prototype.movable = true;
  });

  $('.gascan img').live('mousedown', function (e) {
    if (Fuel.activePump) {
      var gascan = InventoryItem.getInventoryItemFromEvent(e);
      Fuel.activePump.startFueling(gascan);
    }
  }).live('mouseup', function (e) {
    if (Fuel.activePump) {
      Fuel.activePump.stopFueling();
    }
  });

  return GasCan;
});
