define(['Game', 'Sprite', 'Vector'], function (Game, Sprite, Vector) {


  var defaults = {
    fadeDuration:  1, // seconds
    duration:      null,
    throb:         false
  };

  var Hint = function (config) {
    this.config   = _.defaults(config, defaults);
    this.pos      = this.config.pos.clone();
    this.pos.rot  = 0;
    this.life     = this.config.duration;

    this.opacity = 0;

    this.isTop = Game.dude.pos.subtract(this.pos).y > 0;

    this.createNode();
    this.node.text(config.text);

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
      this.opacity = (this.config.fadeDuration + this.life) / this.config.fadeDuration;
    } else if (this.opacity < 1) {
      this.opacity += delta;
      if (this.opacity > 1) {
        this.opacity = 1;
      }
    }

    if (this.config.throb) {
      this.scale = 1 + Math.sin(5 * Math.PI * this.life / this.config.duration) / 20;
    }
  };

  Hint.prototype.postMove = function (delta) {
    this.life -= delta;
    if (this.life < -this.config.fadeDuration) {
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
    create: function (config) {
      var hint = new Hint(config);
      Game.sprites.push(hint);
      return hint;
    }
  };
});
