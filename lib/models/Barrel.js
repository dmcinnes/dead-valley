// the ubiquitous barrel

define(["Sprite",
        "Collidable",
        "Reporter"],
       function (Sprite, Collidable, Reporter) {

  var uprightFriction = -4;
  var rollingFriction = -0.2;

  var Barrel = function () {
    this.init('Barrel');

    this.isRolling = false;

    this.mass    = 0.2;
    this.inertia = 10;

    // start at later barrelState so drawTile actually updates
    this.barrelState = 1;
  };
  Barrel.prototype = new Sprite();

  Barrel.prototype.preMove = function (delta) {
    var velMag = this.vel.magnitude();

    if (velMag > 0) {
      var friction = (this.isRolling) ? rollingFriction : uprightFriction;

      this.vel.translate(this.vel.clone().scale(friction * delta));

      if (this.isRolling) {
        this.vel.rot = 0;
        // follow the rolling direction
        this.pos.rot = (this.vel.angle() * 180 / Math.PI) - 90;
      } else {
        this.vel.rot += this.vel.rot * friction * delta;

        if (velMag > 10) {
          this.setRolling(true);
          Reporter.barrelRolled();
        }
      }
    }
  };

  Barrel.prototype.draw = function (delta) {
    if (this.isRolling) {
      this.barrelState = (this.barrelState + delta * this.vel.magnitude()/10) % 3;
      this.drawTile(Math.floor(this.barrelState), 0);
    } else {
      this.drawTile(0, 0);
    }
  };

  Barrel.prototype.setRolling = function (val) {
    if (val) {
      this.updateForRolling();
    }
    this.isRolling = val;
  };

  Barrel.prototype.updateForRolling = function () {
    // update the rendering info
    // TODO stuff these into the sprite-info thingy
    this.width         = 22;
    this.tileWidth     = 22;
    this.imageOffset.x = 76;
    this.center.x      = 11;
    this.tileOffset    = 22;
    // update the div
    this.node.css('width', this.tileWidth);
  };

  Barrel.prototype.saveMetadata = function () {
    var metadata = Sprite.prototype.saveMetadata.call(this);
    metadata.setRolling = this.isRolling;
    return metadata;
  };

  Collidable(Barrel);

  return Barrel;
});
