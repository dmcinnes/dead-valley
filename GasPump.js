define(["game",
        "sprite",
        "eventmachine",
        "collidable"],
       function (game, Sprite, eventmachine, collidable) {

  var MAX_FUEL         = 100;
  var BROKEN_PERCENT   = 0.3;
  var FUELING_RATE     = 0.5; // gallons per second
  var FUELING_DISTANCE = 40;

  var GasPump = function () {
    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  GasPump.prototype = new Sprite();

  // GasPumps don't move
  GasPump.prototype.move = function (delta) {};
  GasPump.prototype.transformNormals = function () {};

  GasPump.prototype.init = function (config) {
    Sprite.prototype.init.call(this, config);

    this.currentFuel = Math.random() * MAX_FUEL;
    this.broken = Math.random() < BROKEN_PERCENT;

    var self = this;
    game.events.subscribe('mouseup', function () {
      self.stopFueling();
    }).subscribe('stopped touching', function (sprite) {
      if (self === sprite) {
        self.stopFueling();
      }
    });
  };

  GasPump.prototype.preMove = function (delta) {
    if (this.fueling &&
        !this.broken &&
        this.currentFuel) {

      var transferred = FUELING_RATE * delta;
      if (transferred > this.currentFuel) {
        transferred = this.currentFuel;
      }
      if (transferred + this.fueling.currentFuel > this.fueling.fuelCapacity) {
        transferred = this.fueling.fuelCapacity - this.fueling.currentFuel;
      }

      this.fueling.currentFuel += transferred;
      this.currentFuel         -= transferred;
      this.totalTransfer       += transferred;

      this.fireEvent('tip data change');
    }
  };

  // Fill 'er Up
  GasPump.prototype.startFuelingCar = function (car) {
    console.log(this.distance(car));
    if (!this.broken && this.distance(car) < FUELING_DISTANCE) {
      this.fueling = car;
      this.totalTransfer = 0;
    }
  };

  GasPump.prototype.stopFueling = function () {
    this.fueling = null;
  };

  GasPump.prototype.tip = function () {
    if (this.broken) {
      return "Broken";
    } else if (this.currentFuel === 0) {
      return "Empty";
    } else if (this.fueling) {
      if (this.fueling.percentFuelRemaining() === 1) {
        return "Full";
      }
      var precision = 3;
      if (this.totalTransfer >= 10) {
        precision++;
      }
      return this.totalTransfer.toString().substring(0, precision);
    } else {
      return "Has Gas";
    }
  };

  GasPump.prototype.saveMetadata = function () {
    var data = Sprite.prototype.saveMetadata.call(this);
    data.currentFuel = this.currentFuel;
    data.broken      = this.broken;
    return data;
  };

  collidable(GasPump);
  eventmachine(GasPump);

  return GasPump;
});
