// the ubiquitous barrel

define(["sprite",
        "collidable"],
       function (Sprite, collidable) {

  var uprightFriction = -0.8;
  var rollingFriction = -0.2;

  var Barrel = function () {
    this.init('Barrel');

    this.rolling = false;

    this.mass    = 0.2;
    this.inertia = 10;

    this.barrelState = 0;
  };
  Barrel.prototype = new Sprite();

  Barrel.prototype.preMove = function (delta) {
    var friction = (this.rolling) ? rollingFriction : uprightFriction;

    this.vel.translate(this.vel.clone().scale(friction * delta));

    if (this.rolling) {
      this.vel.rot = 0;
      // follow the rolling direction
      this.pos.rot = (Math.atan(this.vel.y / this.vel.x) * 180 / Math.PI) + 90;
    } else {
      this.vel.rot += this.vel.rot * friction * delta;
    }
    
    if (this.vel.magnitude() > 10) {
      this.rolling = true;

      // update the rendering info
      // TODO stuff these into the sprite-info thingy
      this.width         = 22;
      this.tileWidth     = 22;
      this.imageOffset = {
        x: 76,
        y: this.imageOffset.y
      };
      this.center = {
        x: 11,
        y: this.center.y
      };
    }
  };

  Barrel.prototype.draw = function (delta) {
    if (this.rolling) {
      this.barrelState = (this.barrelState + delta * this.vel.magnitude()/10) % 3;
      this.drawTile(Math.floor(this.barrelState));
    } else {
      this.drawTile(0);
    }
  };

  collidable(Barrel);

  return Barrel;
});
