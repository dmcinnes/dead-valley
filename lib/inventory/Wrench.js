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
        car.headlights.left  = true;
        car.headlights.right = true;
        car.taillights.left  = true;
        car.taillights.right = true;
        car.node.removeClass('glow');
      }
    },

    mouseover: function () {
      var car = _.find(Game.dude.touching, function (touch) {
        return touch.isCar;
      });
      if (car && car.health > 0) {
        car.node.addClass('glow');
        Game.dude.once('stopped touching', function (stopped) {
          if (stopped === car) {
            car.node.removeClass('glow');
          }
        });
      }
    },

    mouseout: function () {
      $(".car").removeClass('glow');
    }
  };

  InventoryItem(Wrench, {
    width:       1,
    height:      2,
    image:       'wrench',
    clazz:       'Wrench',
    description: 'Wrench'
  });

  return Wrench;
});
