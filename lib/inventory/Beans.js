// Beans!

define(['Game', 'inventory/InventoryItem'],
       function (Game, InventoryItem) {

  var Beans = function () {
    this.consumed = false;
  };

  Beans.prototype = {
    use: function () {
      Game.dude.heal(1);
      this.consume();
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
    name:   'Can of Beans',
    description: 'The Musical Fruit'
  });

  return Beans;
});
