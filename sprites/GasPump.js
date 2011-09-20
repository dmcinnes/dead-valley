define(["Game",
        "Sprite",
        "EventMachine",
        "Collidable"],
       function (Game, Sprite, eventmachine, Collidable) {

  var MAX_FUEL         = 100;
  var BROKEN_PERCENT   = 0.3;
  var FUELING_RATE     = 0.5; // gallons per second
  var FUELING_DISTANCE = 40;

  var $container = $('#container');

  var GasPump = function (type) {
    this.init(type || 'GasPump1');
    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  GasPump.prototype = new Sprite();

  // GasPumps don't move
  GasPump.prototype.move             = function () {};
  GasPump.prototype.transformNormals = function () {};
  GasPump.prototype.speculativeMove  = function () {};

  GasPump.prototype.init = function (config) {
    Sprite.prototype.init.call(this, config);

    this.currentFuel = Math.random() * MAX_FUEL;
    this.broken      = Math.random() < BROKEN_PERCENT;

    Game.events.subscribe('mouseup', this.stopFueling, this);
    Game.events.subscribe('started touching', this.startedTouching, this);
    Game.events.subscribe('stopped touching', this.stoppedTouching, this);
  };

  GasPump.prototype.startedTouching = function (sprite) {
    if (this === sprite && this.currentFuel && !this.broken) {
      $container.addClass('pump');
      // override gascan's handling
      $('.inventory-item.gascan')
        .bind('mousedown', $.proxy(this.gasCanMouseDownHandler, this))
        .bind('mouseup', $.proxy(this.gasCanMouseUpHandler, this));
    }
  };

  GasPump.prototype.stoppedTouching = function (sprite) {
    if (this === sprite) {
      $container.removeClass('pump');
      this.stopFueling();
      $('.inventory-item.gascan').unbind('mousedown,mouseup');
    }
  };

  GasPump.prototype.die = function () {
    Sprite.prototype.die.call(this);
    Game.events.unsubscribe('mouseup', this.stopFueling);
    Game.events.unsubscribe('started touching', this.startedTouching);
    Game.events.unsubscribe('stopped touching', this.stoppedTouching);
  };

  GasPump.prototype.preMove = function (delta) {
    if (this.fueling &&
        !this.broken &&
        this.currentFuel) {

      var amount = FUELING_RATE * delta;

      // do we have enough fuel to give?
      if (amount > this.currentFuel) {
        amount = this.currentFuel;
      }

      var transferred = this.fueling.addGas(amount);

      this.currentFuel -= transferred;

      if (!this.currentFuel) { // ran out of fuel
        this.fireEvent('tip data change');
        $container.removeClass('pump');
      }

    }
  };

  // Fill 'er Up
  GasPump.prototype.startFuelingCar = function (car) {
    if (!this.broken &&
         this.distance(car) < FUELING_DISTANCE &&
         car.health > 0) {
      this.fueling = car;
      Game.events.fireEvent('start fueling', this.fueling);
    }
  };

  GasPump.prototype.gasCanMouseDownHandler = function (e) {
    e.stopImmediatePropagation();
    var can = $(e.currentTarget).data('item');
    if (!this.broken && can) {
      this.fueling = can;
      can.movable = false;
    }
  };

  GasPump.prototype.gasCanMouseUpHandler = function (e) {
    e.stopImmediatePropagation();
    this.stopFueling();
    var can = $(e.currentTarget).data('item');
    if (can) {
      can.movable = true;
    }
  };

  GasPump.prototype.stopFueling = function () {
    this.fueling = null;
    Game.events.fireEvent('stop fueling', this.fueling);
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

  Collidable(GasPump);
  eventmachine(GasPump);

  return GasPump;
});
