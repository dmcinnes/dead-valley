define(['Game', 'Sprite', 'Vector'], function (Game, Sprite, Vector) {

  var fadeDuration = 1; // seconds

  var Hint = function (pos, text, duration) {
    this.pos     = pos.clone();
    this.pos.rot = 0;
    this.life    = duration || 5;

    this.opacity = 0;

    this.isTop = Game.dude.pos.subtract(this.pos).y > 0;

    this.createNode();
    this.node.text(text);

    this.center = {
      x: this.node.outerWidth() * 0.3 + 10, // magic numbers from CSS
      y: this.node.outerHeight() + 10
    };

    if (!this.isTop) {
      this.center.y = -10;
    }

    this.offset = new Vector(0, 0);
  };
  Hint.prototype = new Sprite();
  Hint.prototype.fx         = true;
  Hint.prototype.stationary = true;

  Hint.prototype.createNode = function () {
    this.node = $('<div/>').addClass('tip');
    this.node.addClass(this.isTop ? 'top' : 'bottom');
    // so it doesn't pop in the upper left corner
    // before it appears where it's supposed to be
    this.node[0].style.opacity = 0;
    this.spriteParent.append(this.node);
  };

  Hint.prototype.draw = function (delta) {
    if (this.life < 0) {
      this.opacity = (fadeDuration + this.life) / fadeDuration;
    } else if (this.opacity < 1) {
      this.opacity += delta;
      if (this.opacity > 1) {
        this.opacity = 1;
      }
    }
  };

  Hint.prototype.postMove = function (delta) {
    this.life -= delta;
    if (this.life < -fadeDuration) {
      this.die();
    }
  };

  Hint.prototype.cleanupDomNodes = function () {
    if (this.node) {
      this.node.remove();
      this.node = null;
    }
  };

  return {
    create: function (pos, text, duration) {
      var hint = new Hint(pos, text, duration);
      Game.sprites.push(hint);
    }
  };
});
