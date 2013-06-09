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
    dropImage:   '9mm-drop',
    accepts:     [Nine_mm],
    clazz:       'Nine_mm',
    description: "9mm Ammunition",
    dropScale:   1
  });

  return Nine_mm;
});
