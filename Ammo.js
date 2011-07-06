// Ammo

define(['game'], function (game) {

  var Ammo = function () {
    this.count = 0;
  };
  Ammo.prototype.maxCount = 99;

  Ammo.prototype.displayNode = function () {
    if (!this.display) {
      this.display = $("<div/>")
	.append($("<span/>").addClass('readout').text(this.count))
	.append($("<img/>").attr('src', this.image));
    }
    return this.display;
  };

  Ammo.prototype.updateDisplay = function () {
    if (this.display) {
      this.display.find('.readout').text(this.count);
    }
  };

  Ammo.prototype.setCount = function (count) {
    // TODO if count is <= 0 this object should disappear
    this.count = count;
    this.updateDisplay();
  };

  Ammo.prototype.accept = function (ammo) {
    var total = this.count + ammo.count;
    if (total > this.maxCount) {
      this.setCount(this.maxCount);
      ammo.setCount(total - this.maxCount);
    } else {
      this.setCount(total);
      ammo.setCount(0);
    }
  };

  Ammo.prototype.viable = function () {
    return this.count > 0;
  };

  return Ammo;
});