// Medkit

define(['Game', 'inventory/InventoryItem'],
       function (Game, InventoryItem) {

  var Medkit = function () {
    this.consumed = false;
  };

  Medkit.prototype = {
    use: function () {
      Game.dude.heal(Game.dude.maxHealth);
      this.inventory.removeItem(this);
    },
    viable: function () {
      return !this.consumed;
    }
  };

  InventoryItem(Medkit, {
    width:  2, 
    height: 2, 
    image:  'medkit',
    clazz:  'Medkit',
    description: 'Medkit'
  });

  return Medkit;
});
