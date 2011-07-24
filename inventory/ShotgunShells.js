// Shotgun Shells

define(['inventory/InventoryItem', 'Ammo'], function (InventoryItem, Ammo) {

  var ShotgunShells = function (count) {
    this.count = count;
  };
  ShotgunShells.prototype = new Ammo();

  InventoryItem(ShotgunShells, {
    width:       1, 
    height:      1, 
    image:       'shotgun_shell',
    accepts:     [ShotgunShells],
    clazz:       'ShotgunShells',
    description: 'Shotgun Shells'
  });

  return ShotgunShells;
});
