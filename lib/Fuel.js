define(['Game', 'EventMachine'], function (Game, EventMachine) {

  // giver

  var giverMethods = {
    activate: function () {
      Fuel.activePump = this;
      Game.events.fireEvent('fuel source active', this);
    }, 

    deactivate: function () {
      Fuel.activePump = null;
      Game.events.fireEvent('fuel source inactive', this);
    }, 

    startFueling: function (fuelee) {
      this.fueling = fuelee;
      this.fireEvent('start fueling', this.fueling);
      Game.events.fireEvent('start fueling', this.fueling);
      fuelee.startReceivingFuel(this);
    },

    giveFuel: function (delta) {
      if (this.fueling && this.currentFuel) {
        var amount = this.fuelingRate * delta;

        // do we have enough fuel to give?
        if (amount > this.currentFuel) {
          amount = this.currentFuel;
        }

        var transferred = this.fueling.receiveFuel(amount);

        this.currentFuel -= transferred;

        if (transferred) {
          this.fireEvent('fuel transferred', transferred);
        }

        if (this.currentFuel === 0) { // ran out of fuel
          this.fireEvent('fuel exhausted');
          this.stopFueling();
        }
      }
    },

    stopFueling: function () {
      var fuelee = this.fueling;
      this.fueling = null;
      this.fireEvent('stop fueling', fuelee);
      Game.events.fireEvent('stop fueling', this.fueling);
    }
  };

  var receiverMethods = {
    startReceivingFuel: function (fueler) {
      this.fireEvent('start receiving fuel', fueler);
    },

    receiveFuel: function (amount) {
      var transferred = amount;
      this.currentFuel += amount;
      if (this.currentFuel > this.fuelCapacity) {
        transferred -= this.currentFuel - this.fuelCapacity;
        this.currentFuel = this.fuelCapacity;
      }
      if (transferred) {
        this.fireEvent('fuel level updated', transferred);
      }
      return transferred;
    },

    stopReceivingFuel: function (fueler) {
      this.fireEvent('stop receiving fuel', fueler);
    },

    percentFuelRemaining: function () {
      return this.currentFuel / this.fuelCapacity;
    },

    consumeFuel: function (delta) {
      var consumption = this.fuelConsumption * delta;
      if (consumption > this.currentFuel) {
        consumption = this.currentFuel;
      }
      this.currentFuel -= consumption;
      if (consumption > 0) {
        this.fireEvent('fuel level updated', consumption);
        Game.events.fireEvent('fuel consumed', consumption);
      }
    },

    hasFuel: function () {
      return this.currentFuel > 0;
    }
  };

  var tick = function (delta) {
    var pump = Fuel.activePump;
    if (pump && pump.fueling) {
      pump.giveFuel(delta);
    }
  };


  var Fuel = {
    giver: function (clazz, rate) {
      clazz.prototype.fuelingRate  = rate;
      _.extend(clazz.prototype, giverMethods);
      EventMachine(clazz);
    },
    receiver: function (clazz) {
      _.extend(clazz.prototype, receiverMethods);
      EventMachine(clazz);
    },
    tick: tick,
    activePump: null
  };

  Game.registerObjectForDeltaUpdates(Fuel);

  // stop fueling when done on the inventory
  $('.inventory').live('mouseup', function (e) {
    if (Fuel.activePump) {
      Fuel.activePump.stopFueling();
    }
  });

  return Fuel;
});
