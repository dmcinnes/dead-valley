define(["Sprite"], function (Sprite) {

  var DropSprite = function (model) {
    this.init(model);

    this.node.addClass('inventory-sprite');
  };
  DropSprite.prototype = new Sprite();

  // override draw
  DropSprite.prototype.draw = function () {
  };

  return DropSprite;
});
