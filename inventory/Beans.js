// The Cake is a Lie

define(['Game', 'inventory/InventoryItem'],
       function (Game, InventoryItem) {

  var Beans = function () {
    this.consumed = false;
  };

  Beans.prototype = {
    use: function () {
      Game.dude.heal(2);
      this.inventory.removeItem(this);
    },
    viable: function () {
      return !this.consumed;
    }
  };

  InventoryItem(Beans, {
    width:  1, 
    height: 1, 
    image:  'beans',
    clazz:  'Beans',
    description: 'The Musical Fruit'
  });

  return Beans;
});
