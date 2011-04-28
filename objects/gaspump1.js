define(["sprite",
        "collidable"],
       function (Sprite, collidable) {

  var GasPump1 = function () {
    this.init('GasPump1');

    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  GasPump1.prototype = new Sprite();

  GasPump1.prototype.move = function (delta) {
  };
  GasPump1.prototype.transformNormals = function () {
  };

  collidable(GasPump1);

  return GasPump1;
});
