// Firearm

define(['game'], function (game) {

  var Firearm = function () {
  };

  Firearm.prototype.damage = 1;
  Firearm.prototype.range = 1000;

  Firearm.prototype.fire = function (start, end) {
    if (this.hasAmmo()) {
      this.decrementAmmo();
      var damage = this.damage;
      game.map.rayTrace(start, end, this.range, function (result, sprite) {
        if (result) { // hit!
          sprite.bulletHit(result, damage);
        }
      });
      return true;
    }
    return false;
  };

  Firearm.prototype.hasAmmo = function () {
    return this.ammo > 0;
  };

  Firearm.prototype.decrementAmmo = function () {
    this.ammo--;
    this.updateDisplay();
  };

  Firearm.prototype.reload = function () {
    this.ammo = this.ammoCapacity;
    this.updateDisplay();
  };

  Firearm.prototype.displayNode = function () {
    if (!this.display) {
      this.display = $("<div/>")
	.append($("<span/>").addClass('readout').text(this.ammo))
	.append($("<img/>").attr('src', this.image));
    }
    return this.display;
  };

  Firearm.prototype.updateDisplay = function () {
    if (this.display) {
      this.display.find('.readout').text(this.ammo);
    }
  };

  return Firearm;
});
