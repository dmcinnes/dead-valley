define(["GasPump"], function (GasPump) {

  var GasPump1 = function () {
    this.init('GasPump1');
  };
  GasPump1.prototype = new GasPump();

  return GasPump1;
});
