define(['Sprite'], function (Sprite) {

  var PickupSprite = function (car) {
    this.init(car);
  };
  PickupSprite.prototype = new Sprite();

  return PickupSprite;
});
