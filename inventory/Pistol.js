// Pistol

define(['Firearm'], function (Firearm) {
  var Pistol = function () {
    // start with fully loaded for now
    this.reload();
  };
  Pistol.prototype = new Firearm();

  Pistol.prototype.damage = 1;
  Pistol.prototype.ammoCapacity = 8;

  return Pistol;
});
