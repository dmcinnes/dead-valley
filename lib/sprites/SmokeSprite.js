define(['Sprite'], function (Sprite) {

  var SmokeSprite = function (model) {
    this.init(model);
  };
  SmokeSprite.prototype = new Sprite();

  SmokeSprite.prototype.draw = function (delta) {
    this.drawTile(this.model.frame);
  };

  return SmokeSprite;
});
