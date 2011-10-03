define(["Game",
        "Sprite",
        "EventMachine",
        "Collidable",
        "Fuel"],
       function (Game, Sprite, eventmachine, Collidable, Fuel) {

  var MAX_FUEL         = 10;
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
    this.subscribe('fuel exhausted', function () {
      this.fireEvent('tip data change'); // update the tooltip
    }, this);
  };

  GasPump.prototype.startedTouching = function (sprite) {
    if (this === sprite && this.currentFuel && !this.broken) {
      $container.addClass('pump');
      this.activate();
      Game.events.fireEvent('fuel source active', this);
    }
  };

  GasPump.prototype.stoppedTouching = function (sprite) {
    if (this === sprite) {
      $container.removeClass('pump');
      this.stopFueling();
      this.deactivate();
      Game.events.fireEvent('fuel source inactive', this);
    }
  };

  GasPump.prototype.die = function () {
    Sprite.prototype.die.call(this);
    Game.events.unsubscribe('mouseup', this.stopFueling);
    Game.events.unsubscribe('started touching', this.startedTouching);
    Game.events.unsubscribe('stopped touching', this.stoppedTouching);
  };

  GasPump.prototype.preMove = function (delta) {
    if (!this.broken && this.fueling) {
      this.giveFuel(delta);
    }
  };

  GasPump.prototype.isCarCloseEnough = function (car) {
    return this.distance(car) < FUELING_DISTANCE;
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
  Fuel.giver(GasPump, FUELING_RATE);

  return GasPump;
});
