// Peanut Butter Jelly, Peanut Butter Jelly, Peanut Butter Jelly with a Baseball Bat!

define(['MeleeWeapon', 'inventory/InventoryItem', 'vector'],
       function (MeleeWeapon, InventoryItem, Vector) {

  var BaseballBat = function () {
  };
  BaseballBat.prototype = new MeleeWeapon();

  BaseballBat.prototype.damage            = 2;
  BaseballBat.prototype.swingStart        = new Vector(0, 0);
  BaseballBat.prototype.swingEnd          = new Vector(10, -10);
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
