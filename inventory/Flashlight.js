// Pistol

define(['inventory/InventoryItem'], function (InventoryItem) {
  var Flashlight = function () {
  };

  InventoryItem(Flashlight, {
    width:  1, 
    height: 3, 
    image:  'flashlight'
  });

  return Flashlight;
});
