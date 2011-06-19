// Pistol

define(['Firearm', 'inventory/InventoryAsset'], function (Firearm, InventoryAsset) {
  var Pistol = function () {
    // start with fully loaded for now
    this.reload();
  };
  Pistol.prototype = new Firearm();

  Pistol.prototype.damage = 1;
  Pistol.prototype.ammoCapacity = 1000; // for testing

  InventoryAsset(Pistol, 1, 2, 'pistol');

  return Pistol;
});
