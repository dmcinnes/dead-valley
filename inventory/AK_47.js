// AK-47

define(['Firearm', 'inventory/InventoryItem'], function (Firearm, InventoryItem) {
  var AK_47 = function () {
    // start with fully loaded for now
    this.reload();
  };
  AK_47.prototype = new Firearm();

  AK_47.prototype.damage = 3;
  AK_47.prototype.ammoCapacity = 30;

  InventoryItem(AK_47, {
    width:  2, 
    height: 3, 
    image:  'AK-47',
    clazz: 'AK_47',
    description: 'AK-47'
  });

  return AK_47;
});
