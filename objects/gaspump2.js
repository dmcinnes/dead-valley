define(["sprite",
        "collidable"],
       function (Sprite, collidable) {

  var GasPump2 = function () {
    this.init('GasPump2');

    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  GasPump2.prototype = new Sprite();

  GasPump2.prototype.move = function (delta) {
  };
  GasPump2.prototype.transformNormals = function () {
  };

  collidable(GasPump2);

  return GasPump2;
});
