// Remington 700 Rifle

define(['Firearm', 'inventory/InventoryItem', 'inventory/TwoTwoThree'],
       function (Firearm, InventoryItem, TwoTwoThree) {

  var Remington700 = function () {
    // start with fully loaded for now
    this.reload();
  };
  Remington700.prototype = new Firearm();

  Remington700.prototype.damage       = 3;
  Remington700.prototype.ammoCapacity = 5;
  Remington700.prototype.isHandgun    = false;
  Remington700.prototype.range        = 4000;
  Remington700.prototype.ammoType     = TwoTwoThree;
  Remington700.prototype.audio        = 'rifle';

  InventoryItem(Remington700, {
    width:       2,
    height:      3,
    image:       'Remington700',
    accepts:      [TwoTwoThree],
    clazz:       'Remington700',
    description: 'Remington 700 Bolt Action Rifle',
    dropScale:   0.25
  });

  return Remington700;
});
