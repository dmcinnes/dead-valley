// Donut

define(['Game', 'inventory/InventoryItem'],
       function (Game, InventoryItem) {


  var Donut = function () {
    this.consumed = false;
  };

  Donut.prototype = {
    use: function () {
      Game.dude.heal(3);
      this.consume();
    },
    viable: function () {
      return !this.consumed;
    }
  };

  InventoryItem(Donut, {
    width: 1,
    height: 1,
    image: 'donut',
    clazz: 'Donut',
    description: 'DONUT'
  });

  return Donut;
});
