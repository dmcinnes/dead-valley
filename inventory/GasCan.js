// GasCan

define(['Game', 'inventory/InventoryItem'],
       function (Game, InventoryItem) {

  var GasCan = function () {
    this.consumed = false;
  };

  GasCan.prototype = {
    use: function () {
      this.inventory.removeItem(this);
    },
    viable: function () {
      return !this.consumed;
    }
  };

  InventoryItem(GasCan, {
    width:  2, 
    height: 3, 
    image:  'gascan',
    clazz:  'GasCan',
    description: 'Gas Can'
  });

  return GasCan;
});
