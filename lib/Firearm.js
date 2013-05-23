// Firearm

define(['Game', 'fx/MuzzleFlash', 'fx/Audio'], function (Game, MuzzleFlash, Audio) {

  var Firearm = function () {
  };

  Firearm.prototype.damage    = 1;
  Firearm.prototype.range     = 1000;
  Firearm.prototype.aimable   = true;
  Firearm.prototype.isHandgun = false;
  Firearm.prototype.isFirearm = true;
  Firearm.prototype.enabled   = true;

  Firearm.prototype.fire = function (start, end) {
    if (this.enabled && this.hasAmmo()) {
      if (this.audio) {
        // disable while sound is playing
        var self = this;
        self.enabled = false;
        Audio[this.audio].fire.play(function () {
          self.enabled = true;
        });
      }
      this.decrementAmmo();
      // bullet can fly further than where we're aiming
      var maxEnd = end.subtract(start).normalize().scale(this.range).translate(start);
      this.traceBullet(start, maxEnd);
      MuzzleFlash.createNew(start);
      Game.events.fireEvent('firearm discharged', this, start, end);
      return true;
    }
    return false;
  };

  Firearm.prototype.traceBullet = function (start, end) {
    var self = this;
    Game.map.rayTrace(start, end, this.range, function (result, sprite) {
      if (result) { // hit!
        sprite.bulletHit(result, self.damage, self);
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
    this.ammo = parseInt(ammo, 10);
    this.updateDisplay();
  };

  Firearm.prototype.eject = function () {
    if (this.hasAmmo() && this.audio) {
      Audio[this.audio].reload.play();
    }
    var count = this.ammo;
    this.ammo = 0;
    this.updateDisplay();
    return count;
  };

  Firearm.prototype.isFull = function () {
    return this.ammo === this.ammoCapacity;
  };

  Firearm.prototype.displayNode = function () {
    if (!this.display) {
      this.display = $("<div/>")
	.append($("<span/>").addClass('readout').text(this.ammo))
	.append($("<img/>").attr('src', this.image).attr('title', this.description));
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
    if (!this.isFull() && this.audio) {
      Audio[this.audio].reload.play();
    }
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
