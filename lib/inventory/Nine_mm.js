// 9mm Ammo

define(['inventory/InventoryItem', 'Ammo'], function (InventoryItem, Ammo) {

  var Nine_mm = function (count) {
    this.count = count;
  };
  Nine_mm.prototype = new Ammo();

  InventoryItem(Nine_mm, {
    width:       1, 
    height:      1, 
    image:       '9mm',
    accepts:     [Nine_mm],
    clazz:       'Nine_mm',
    description: "9mm Ammunition",
    dropScale:   0.25,
    dropRotate:  true
  });

  return Nine_mm;
});
