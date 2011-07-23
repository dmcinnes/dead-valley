define(["game",
        "sprite",
        "collidable"],
       function (game, Sprite, collidable) {

  var MAX_FUEL = 1000;
  var BROKEN_PERCENT = 0.3;
  var FUELING_RATE = 0.5; // gallons per second

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
    });
  };

  GasPump.prototype.preMove = function (delta) {
    if (this.fueling &&
        !this.broken &&
        this.currentFuel &&
        this.fueling.percentFuelRemaining() < 1) {

      var transferred = FUELING_RATE * delta;
      if (transferred > this.currentFuel) {
        transferred = this.currentFuel;
      }
      if (transferred + this.fueling.currentFuel > this.fueling.fuelCapacity) {
        transferred = this.fueling.fuelCapacity - this.fueling.currentFuel;
      }

      this.fueling.currentFuel += transferred;
      this.currentFuel -= transferred;
    }
  };

  // Fill 'er Up
  GasPump.prototype.startFuelingCar = function (car) {
    if (!this.broken) {
      this.fueling = car;
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

  return GasPump;
});
