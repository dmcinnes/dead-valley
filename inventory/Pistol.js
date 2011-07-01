// Pistol

define(['Firearm', 'inventory/InventoryItem'], function (Firearm, InventoryItem) {
  var Pistol = function () {
    // start with fully loaded for now
    this.reload();
  };
  Pistol.prototype = new Firearm();

  Pistol.prototype.damage       = 1;
  Pistol.prototype.ammoCapacity = 12;
  Pistol.prototype.isHandgun    = true;

  InventoryItem(Pistol, {
    width:  1, 
    height: 2, 
    image:  'pistol'
  });

  return Pistol;
});
