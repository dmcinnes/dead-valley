define(['Game', 'inventory/InventoryItem'],
       function (Game, InventoryItem) {

  var Wrench = function () {
  };

  Wrench.prototype = {
    use: function () {
      var car = _.detect(Game.dude.touching, function (sprite) {
        return sprite.isCar;
      });
      if (car && car.health > 0) {
	this.consume();
	car.health = 100;
      }
    },
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
