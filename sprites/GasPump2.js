define(["GasPump"], function (GasPump) {

  var GasPump2 = function () {
    this.init('GasPump2');
  };
  GasPump2.prototype = new GasPump();

  return GasPump2;
});
