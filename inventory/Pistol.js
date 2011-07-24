// Pistol

define(['Firearm', 'inventory/InventoryItem', 'inventory/Nine_mm'],
       function (Firearm, InventoryItem, Nine_mm) {

  var Pistol = function () {
    // start with fully loaded for now
    this.reload();
  };
  Pistol.prototype = new Firearm();

  Pistol.prototype.damage       = 1;
  Pistol.prototype.ammoCapacity = 12;
  Pistol.prototype.isHandgun    = true;
  Pistol.prototype.range        = 900;
  Pistol.prototype.ammoType     = Nine_mm;

  InventoryItem(Pistol, {
    width:  1, 
    height: 2, 
    image:  'pistol',
    accepts: [Nine_mm],
    clazz:  'Pistol'
  });

  return Pistol;
});
