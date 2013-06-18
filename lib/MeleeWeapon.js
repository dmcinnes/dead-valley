
define(['Game', 'Vector', 'fx/Audio'], function (Game, Vector, Audio) {

  var MeleeWeapon = function () {
  };

  MeleeWeapon.prototype.isMeleeWeapon     = true;
  MeleeWeapon.prototype.aimable           = false;
  MeleeWeapon.prototype.damage            = 1;
  MeleeWeapon.prototype.swingStart        = Vector.create(0, 0, true);
  MeleeWeapon.prototype.swingEnd          = Vector.create(10, -10, true);
  MeleeWeapon.prototype.reach             = 15;
  MeleeWeapon.prototype.handsSpriteOffset = 16;
  MeleeWeapon.prototype.resetTimeout      = 250; // in ms

  MeleeWeapon.prototype.fire = function (pos, coords, isLeft) { // swing
    if (this.resetting) {
      return false;
    }

    var start = pos.add(this.swingStart);
    var end   = this.swingEnd.clone();
    // swingEnd always goes to the right
    // have to flip it to the left if that's the way we're pointing
    if (isLeft) {
      end.x *= -1;
    }
    end.translate(pos);

    var self = this;
    Game.map.rayTrace(start, end, this.reach, function (result, sprite) {
      if (result) { // hit!
        Audio.dude.hit.play(); // bonk
        sprite.bulletHit(result, self.damage, self);
      }
    });

    // can only swing once every resetTimeout ms
    var self = this;
    this.resetting = true;
    window.setTimeout(function () {
      self.resetting = false;
    }, this.resetTimeout);

    return true; // true we succeeded in swinging a bat
  };

  return MeleeWeapon;
});
