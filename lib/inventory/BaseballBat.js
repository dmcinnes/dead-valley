// Peanut Butter Jelly, Peanut Butter Jelly, Peanut Butter Jelly with a Baseball Bat!

define(['MeleeWeapon', 'inventory/InventoryItem', 'Vector'],
       function (MeleeWeapon, InventoryItem, Vector) {

  var BaseballBat = function () {
  };
  BaseballBat.prototype = new MeleeWeapon();

  BaseballBat.prototype.damage            = 2;
  BaseballBat.prototype.swingStart        = Vector.create(0, 0, true);
  BaseballBat.prototype.swingEnd          = Vector.create(10, -10, true);
  BaseballBat.prototype.reach             = 15;
  BaseballBat.prototype.handsSpriteOffset = 16;

  InventoryItem(BaseballBat, {
    width:  1, 
    height: 3, 
    image:  'baseball_bat',
    clazz:  'BaseballBat',
    description: 'Peanut Butter Jelly, Peanut Butter Jelly, Peanut Butter Jelly with a Baseball Bat!'
  });

  return BaseballBat;
});
