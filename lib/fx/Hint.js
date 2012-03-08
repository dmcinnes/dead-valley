define(['Game', 'Sprite', 'Vector'], function (Game, Sprite, Vector) {

  var currentHints = [];

  var defaults = {
    fadeDuration:  1,      // how long it takes to fade in/out in seconds
    duration:      null,   // how long is lasts (including fade time)
    tail:          true,   // does it have a tail that points to something
    tailSide:      'left', // which side is the tail on
    throb:         false,  // does it scale up and down
    static:        false   // does it not move when the screen moves
  };

  var Hint = function (config) {
    this.config = _.defaults(config, defaults);

    if (this.config.windowPos) {
      var windowCoords = this.config.windowPos;
      this.pos = Game.map.worldCoordinatesFromWindow(windowCoords.x, windowCoords.y);
      this.config.static = true;
    } else {
      this.pos = this.config.pos.clone();
    }

    this.pos.rot = 0;
    this.life    = this.config.duration;
    this.opacity = 0;

    if (this.config.tail === 'top') {
      this.isTop = true;
    } else if (this.config.tail === 'bottom') {
      this.isTop = false;
    } else {
      this.isTop = Game.dude.pos.subtract(this.pos).y < 0;
    }

    this.createNode();

    this.center = {
      x: this.node.outerWidth() * 0.3 + 10, // magic numbers from CSS
      y: this.node.outerHeight() + 10
    };

    if (this.isTop) {
      this.center.y = -10;
    }

    if (this.config.static) {
      Game.events.subscribe('map scroll', this.updatePosition, this);
    }

    this.offset = new Vector(0, 0);
  };
  Hint.prototype = new Sprite();
  Hint.prototype.fx         = true;
  Hint.prototype.stationary = true;

  Hint.prototype.createNode = function () {
    this.node = $('<div/>').addClass('tip');
    if (this.config.tail) {
      this.node.addClass(this.isTop ? 'top' : 'bottom');
    }
    if (this.config.tailSide === 'right') {
      this.node.addClass('flip');
    }
    this.node.html(this.config.text);
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

  Hint.prototype.updatePosition = function (vec) {
    this.pos.translate(vec);
  };

  Hint.prototype.cleanupDomNodes = function () {
    if (this.node) {
      this.node.remove();
      this.node = null;
    }
  };

  Hint.prototype.die = function () {
    Sprite.prototype.die.call(this);
    Game.events.unsubscribe('map scroll', this.updatePosition);
    currentHints.splice(currentHints.indexOf(this), 1);
  };

  return {
    create: function (config) {
      var hint = new Hint(config);
      currentHints.push(hint);
      Game.sprites.push(hint);
      return hint;
    },
    dismissAll: function () {
      _.each(currentHints, function (hint) {
        hint.life = 0;
      });
    }
  };
});
