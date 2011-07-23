define(["sprite",
        "collidable"],
       function (Sprite, collidable) {

  var GasPump = function () {
    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  GasPump.prototype = new Sprite();

  GasPump.prototype.move = function (delta) {
  };
  GasPump.prototype.transformNormals = function () {
  };

  GasPump.prototype.tip = function () {
    return "hello";
  };

  collidable(GasPump);

  return GasPump;
});
