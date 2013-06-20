define(['Sprite'], function (Sprite) {

  var HondaSprite = function (car) {
    this.init(car);
  };
  HondaSprite.prototype = new Sprite();

  return HondaSprite;
});
