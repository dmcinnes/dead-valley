
define(['game', 'vector'], function (game, Vector) {

  var MeleeWeapon = function () {
  };

  MeleeWeapon.prototype.isMeleeWeapon     = true;
  MeleeWeapon.prototype.damage            = 1;
  MeleeWeapon.prototype.swingStart        = new Vector(0, 0);
  MeleeWeapon.prototype.swingEnd          = new Vector(10, -10);
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

    var damage = this.damage;
    game.map.rayTrace(start, end, this.reach, function (result, sprite) {
      if (result) { // hit!
        sprite.bulletHit(result, damage);
      }
    });

    return true; // true we succeeded in swinging a bat
  };

  return MeleeWeapon;
});
