define(['Sprite'], function (Sprite) {

  var ZombieSprite = function (zombie) {
    this.init(zombie);
  };
  ZombieSprite.prototype = new Sprite();

  return ZombieSprite;
});
