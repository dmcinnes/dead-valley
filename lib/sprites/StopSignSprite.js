define(['Sprite'], function (Sprite) {

  var StopSignSprite = function (model) {
    this.init(model);
  };
  StopSignSprite.prototype = new Sprite();

  StopSignSprite.prototype.draw = function () {
    this.drawTile(this.model.tile, 0);
  };

  return StopSignSprite;
});
