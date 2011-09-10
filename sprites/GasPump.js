define(["game",
        "sprite",
        "eventmachine",
        "collidable"],
       function (game, Sprite, eventmachine, collidable) {

  var MAX_FUEL         = 100;
  var BROKEN_PERCENT   = 0.3;
  var FUELING_RATE     = 0.5; // gallons per second
  var FUELING_DISTANCE = 40;

  var GasPump = function (type) {
    this.init(type || 'GasPump1');
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
    this.broken      = Math.random() < BROKEN_PERCENT;

    game.events.subscribe('mouseup', this.stopFueling, this);
    game.events.subscribe('stopped touching', this.stoppedTouching, this);
  };

  GasPump.prototype.stoppedTouching = function (sprite) {
    if (this === sprite) {
      this.stopFueling();
    }
  };

  GasPump.prototype.die = function () {
    Sprite.prototype.die.call(this);
    game.events.unsubscribe('mouseup', this.stopFueling);
    game.events.unsubscribe('stopped touching', this.stoppedTouching);
  };

  GasPump.prototype.preMove = function (delta) {
    if (this.fueling &&
        !this.broken &&
        this.currentFuel) {

      var transferred = FUELING_RATE * delta;

      // do we have enough fuel to give?
      if (transferred > this.currentFuel) {
        transferred = this.currentFuel;
      }

      // can the car take it?
      if (transferred + this.fueling.currentFuel > this.fueling.fuelCapacity) {
        transferred = this.fueling.fuelCapacity - this.fueling.currentFuel;
      }

      this.fueling.currentFuel += transferred;
      this.currentFuel         -= transferred;

      if (!this.currentFuel) { // ran out of fuel
        this.fireEvent('tip data change');
      }

      if (transferred) {
        game.events.fireEvent('fuel level updated', this.fueling);
      }
    }
  };

  // Fill 'er Up
  GasPump.prototype.startFuelingCar = function (car) {
    if (!this.broken &&
         this.distance(car) < FUELING_DISTANCE &&
         car.health > 0) {
      this.fueling = car;
      game.events.fireEvent('start fueling', this.fueling);
    }
  };

  GasPump.prototype.stopFueling = function () {
    this.fueling = null;
    game.events.fireEvent('stop fueling', this.fueling);
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
  eventmachine(GasPump);

  return GasPump;
});
