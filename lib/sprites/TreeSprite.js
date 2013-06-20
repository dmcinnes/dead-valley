define(['Sprite'], function (Sprite) {

  var TreeSprite = function (tree) {
    this.init(tree);
  };
  TreeSprite.prototype = new Sprite();

  return TreeSprite;
});
