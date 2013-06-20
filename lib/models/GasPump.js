define(["Game",
        "Sprite",
        "EventMachine",
        "Collidable",
        "Fuel"],
       function (Game, Sprite, eventmachine, Collidable, Fuel) {

  var MAX_FUEL         = 10;
  var BROKEN_PERCENT   = 0.3;
  var FUELING_RATE     = 0.5; // gallons per second
  var FUELING_DISTANCE = 50;

  var $container = $('#container');

  var GasPump = function (type) {
    this.init(type || 'GasPump1');
    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  GasPump.prototype = new Sprite();
  GasPump.prototype.stationary = true;
  GasPump.prototype.isGasPump = true;

  GasPump.prototype.init = function (config) {
    Sprite.prototype.init.call(this, config);

    this.currentFuel = Math.random() * MAX_FUEL;
    this.broken      = Math.random() < BROKEN_PERCENT;

    Game.events.subscribe('mouseup', this.stopFueling, this);
    this.subscribe('fuel exhausted', function () {
      this.fireEvent('tip data change'); // update the tooltip
      this.deactivate();
    }, this);
  };

  GasPump.prototype.startedTouching = function () {
    if (this.currentFuel && !this.broken) {
      $container.addClass('pump');
      this.activate();
    }
  };

  GasPump.prototype.stoppedTouching = function () {
    $container.removeClass('pump');
    this.stopFueling();
    this.deactivate();
  };

  GasPump.prototype.die = function () {
    Sprite.prototype.die.call(this);
    Game.events.unsubscribe('mouseup', this.stopFueling);
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


  Game.events.subscribe('new dude', function (dude) {
    dude.subscribe('started touching', function (thing) {
      if (thing.isGasPump) {
        thing.startedTouching();
      }
    }).subscribe('stopped touching', function (thing) {
      if (thing.isGasPump) {
        thing.stoppedTouching();
      }
    });
  });

  Collidable(GasPump);
  eventmachine(GasPump);
  Fuel.giver(GasPump, FUELING_RATE);

  return GasPump;
});
