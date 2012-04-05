
define(['Game', 'Vector'], function (Game, Vector) {

  var MeleeWeapon = function () {
  };

  MeleeWeapon.prototype.isMeleeWeapon     = true;
  MeleeWeapon.prototype.aimable           = false;
  MeleeWeapon.prototype.damage            = 1;
  MeleeWeapon.prototype.swingStart        = new Vector(0, 0, true);
  MeleeWeapon.prototype.swingEnd          = new Vector(10, -10, true);
  MeleeWeapon.prototype.reach             = 15;
  MeleeWeapon.prototype.handsSpriteOffset = 16;

  MeleeWeapon.prototype.fire = function (pos, coords, isLeft) { // swing
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
        sprite.bulletHit(result, self.damage, self);
      }
    });

    return true; // true we succeeded in swinging a bat
  };

  return MeleeWeapon;
});
