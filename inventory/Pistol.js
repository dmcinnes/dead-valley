// Pistol

define(['Firearm', 'inventory/InventoryItem'], function (Firearm, InventoryItem) {
  var Pistol = function () {
    // start with fully loaded for now
    this.reload();
  };
  Pistol.prototype = new Firearm();

  Pistol.prototype.damage = 1;
  Pistol.prototype.ammoCapacity = 1000; // for testing

  InventoryItem(Pistol, 1, 2, 'pistol');

  return Pistol;
});
