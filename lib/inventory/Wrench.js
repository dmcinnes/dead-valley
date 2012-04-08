define(['Game', 'inventory/InventoryItem'],
       function (Game, InventoryItem) {

  var Wrench = function () {
  };

  Wrench.prototype = {
  };

  InventoryItem(Wrench, {
    width:  1, 
    height: 2, 
    image:  'wrench',
    clazz:  'Wrench',
    description: 'Wrench'
  });

  return Wrench;
});
