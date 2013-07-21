// Blood SplatterSprites!

define(['Sprite'], function (Sprite) {

  var SplatterSprite = function (model) {
    this.init(model);

    this.drawSplatterSprite();
  };
  SplatterSprite.prototype = new Sprite();

  SplatterSprite.prototype.createNode = function () {
    var model = this.model;
    var node = $('<canvas/>').attr('width', model.tileWidth).attr('height', model.tileHeight);
    node.addClass('sprite');
    node.css('z-index', model.z);

    this.spriteParent.append(node);

    this.associatedDomNodes.push(node);

    return node;
  };

  SplatterSprite.prototype.drawSplatterSprite = function () {
    var model = this.model;
    var context = this.node[0].getContext('2d');
    context.fillStyle = model.color;
    context.shadowBlur = 1;
    var count = model.dots.length;
    for (var i = 0; i < count; i++) {
      var vector = model.dots[i];
      context.fillRect(vector.x, vector.y, vector.size, vector.size);
    }
  };

  // override
  SplatterSprite.prototype.draw = function () {
  };

  // override
  // (so we don't try to load an image for this)
  SplatterSprite.prototype.updateBackgroundImages = function () {
  };

  return SplatterSprite;
});
