// Firearm

define(['game'], function (game) {
  var Firearm = function () {
  };

  Firearm.prototype.damage = 1;

  Firearm.prototype.fire = function (point) {
    if (this.hasAmmo()) {
      this.decrementAmmo();
      return true;
    }
    return false;
  };

  Firearm.prototype.hasAmmo = function () {
    return this.ammo > 0;
  };

  Firearm.prototype.decrementAmmo = function () {
    this.ammo--;
  };

  Firearm.prototype.reload = function () {
    this.ammo = this.ammoCapacity;
  };

  return Firearm;
});
