// .223 Ammo

define(['inventory/InventoryItem', 'Ammo'], function (InventoryItem, Ammo) {

  var TwoTwoThree = function (count) {
    this.count = count;
  };
  TwoTwoThree.prototype = new Ammo();

  InventoryItem(TwoTwoThree, {
    width:       1, 
    height:      1, 
    image:       '223',
    dropImage:   '223-drop',
    accepts:     [TwoTwoThree],
    clazz:       'TwoTwoThree',
    description: ".223 Rifle Ammunition",
    dropScale:   1
  });

  return TwoTwoThree;
});

