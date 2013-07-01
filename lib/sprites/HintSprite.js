define(['Game', 'Sprite', 'Vector'], function (Game, Sprite, Vector) {

  var HintSprite = function (model) {
    this.init(model);

    this.setText(model.config.text);

    if (model.config.id) {
      this.node.attr('id', model.config.id);
    }

    // yuck
    // TODO don't modify the model
    model.center = {
      x: this.node.outerWidth() / 2,
      y: this.node.outerHeight() + 10
    };

    if (model.isTop) {
      model.center.y = -10 - model.yoffset;
    } else {
      model.center.y += model.yoffset;
    }

    if (model.config.stationary) {
      // render once to put it in place
      this.render(0.01);
      // override render with our stationary one
      this.render = this.stationaryRender;
    }
  };
  HintSprite.prototype = new Sprite();

  // override
  HintSprite.prototype.createNode = function () {
    var hint = this.model;
    var node = $('<div/>').addClass('tip');
    if (hint.config.tail) {
      node.addClass(hint.isTop ? 'top' : 'bottom');
    }
    if (hint.config.tailSide) {
      node.addClass(hint.config.tailSide);
    }
    if (hint.config.clickable) {
      node.addClass('clickable');
    }
    // so it doesn't pop in the upper left corner
    // before it appears where it's supposed to be
    node[0].style.opacity = 0;
    this.spriteParent.append(node);

    return node;
  };

  // override
  HintSprite.prototype.cleanupDomNodes = function () {
    if (this.node) {
      this.node.remove();
      this.node = null;
    }
  };

  // override
  HintSprite.prototype.draw = function () {
  };

  HintSprite.prototype.setText = function (text) {
    if (this.node) {
      this.node.html(text);
    }
  };

  HintSprite.prototype.stationaryRender = function (delta) {
    // update opacity
    this.node[0].style.opacity = this.model.opacity;
  };

  return HintSprite;
});
