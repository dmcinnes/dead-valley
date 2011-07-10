// Firearm

define(['game'], function (game) {

  var Firearm = function () {
  };

  Firearm.prototype.damage    = 1;
  Firearm.prototype.range     = 1000;
  Firearm.prototype.aimable   = true;
  Firearm.prototype.isHandgun = false;

  Firearm.prototype.fire = function (start, end) {
    if (this.hasAmmo()) {
      this.decrementAmmo();
      this.traceBullet(start, end);
      return true;
    }
    return false;
  };

  Firearm.prototype.traceBullet = function (start, end) {
    var damage = this.damage;
    game.map.rayTrace(start, end, this.range, function (result, sprite) {
      if (result) { // hit!
        sprite.bulletHit(result, damage);
      }
    });
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

  Firearm.prototype.setAmmo = function (ammo) {
    this.ammo = ammo;
    this.updateDisplay();
  };

  Firearm.prototype.isFull = function () {
    return this.ammo === this.ammoCapacity;
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

  // accept dropped ammo
  Firearm.prototype.accept = function (shells) {
    var total = this.ammo + shells.count;
    if (total > this.ammoCapacity) {
      this.setAmmo(this.ammoCapacity);
      shells.setCount(total - this.ammoCapacity);
    } else {
      this.setAmmo(total);
      shells.setCount(0);
    }
  };

  Firearm.prototype.saveMetadata = function () {
    return {
      ammo: this.ammo
    };
  };

  return Firearm;
});
