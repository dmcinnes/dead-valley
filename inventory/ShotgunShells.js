// Shotgun Shells

define(['inventory/InventoryItem'], function (InventoryItem) {
  var ShotgunShells = function () {
  };

  InventoryItem(ShotgunShells, {
    width:  1, 
    height: 1, 
    image:  'shotgun_shell'
  });

  return ShotgunShells;
});
