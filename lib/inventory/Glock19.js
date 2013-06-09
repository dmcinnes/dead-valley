// Glock 19

define(['Firearm', 'inventory/InventoryItem', 'inventory/Nine_mm'],
       function (Firearm, InventoryItem, Nine_mm) {

  var Glock19 = function () {
    // start with fully loaded for now
    this.reload();
  };
  Glock19.prototype = new Firearm();

  Glock19.prototype.damage       = 1;
  Glock19.prototype.ammoCapacity = 15;
  Glock19.prototype.isHandgun    = true;
  Glock19.prototype.range        = 800;
  Glock19.prototype.ammoType     = Nine_mm;
  Glock19.prototype.audio        = 'glock';

  InventoryItem(Glock19, {
    width:       1,
    height:      2,
    image:       'glock19',
    accepts:     [Nine_mm],
    clazz:       'Glock19',
    description: '9mm Glock 19'
  });

  return Glock19;
});
