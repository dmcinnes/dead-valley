// the ubiquitous barrel

define(["sprite",
        "collidable"],
       function (Sprite, collidable) {

  var friction = -0.8;

  var Barrel = function () {
    this.init('Barrel');

    this.mass    = 0.2;
    this.inertia = 10;
  };
  Barrel.prototype = new Sprite();

  Barrel.prototype.preMove = function (delta) {
    this.vel.translate(this.vel.clone().scale(friction * delta));
    this.vel.rot += this.vel.rot * friction * delta;
  };

  collidable(Barrel);

  return Barrel;
});
