define(['Sprite'], function (Sprite) {

  var MinivanSprite = function (car) {
    this.init(car);
  };
  MinivanSprite.prototype = new Sprite();

  return MinivanSprite;
});
