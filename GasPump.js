define(["sprite",
        "collidable"],
       function (Sprite, collidable) {

  var MAX_FUEL = 1000;
  var BROKEN_PERCENT = 0.3;

  var GasPump = function () {
    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  GasPump.prototype = new Sprite();

  GasPump.prototype.move = function (delta) {
  };
  GasPump.prototype.transformNormals = function () {
  };

  GasPump.prototype.init = function (config) {
    Sprite.prototype.init.call(this, config);

    this.currentFuel = Math.random() * MAX_FUEL;
    this.broken = Math.random() < BROKEN_PERCENT;
  };

  GasPump.prototype.tip = function () {
    return (this.broken) ? "Broken" : Math.floor(this.currentFuel) + " Gallons";
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
