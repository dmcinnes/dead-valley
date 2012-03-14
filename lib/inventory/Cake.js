// The Cake is a Lie

define(['Game', 'inventory/InventoryItem'],
       function (Game, InventoryItem) {

  var Cake = function () {
    this.consumed = false;
  };

  Cake.prototype = {
    use: function () {
      Game.dude.heal(2);
      this.consume();
    },
    viable: function () {
      return !this.consumed;
    }
  };

  InventoryItem(Cake, {
    width:  1, 
    height: 1, 
    image:  'cake',
    clazz:  'Cake',
    description: 'Mmmmmmmmm...Cake'
  });

  return Cake;
});
