define(['Game', 'Sprite', 'Vector'], function (Game, Sprite, Vector) {

  var currentHints = [];

  var transformKey = Modernizr.prefixed('transform');

  var defaults = {
    opacity:       0.8,    // final opacity
    fadeDuration:  1,      // how long it takes to fade in/out in seconds
    duration:      null,   // how long is lasts (including fade time)
    tail:          true,   // does it have a tail that points to something
    tailSide:      null,   // which side is the tail on (default center)
    throb:         false,  // does it scale up and down
    stationary:    false,  // does it not move when the screen moves
    clickable:     false,  // lets clicks pass through
    callback:      null,   // ran after hint is gone
    id:            null    // what ID to give this hint
  };

  var Hint = function (config) {
    this.config = _.defaults(config, defaults);

    var xoffset = 0;
    var yoffset = 0;

    if (this.config.windowPos) {
      var windowCoords = this.config.windowPos;
      var offset = Vector.create(Game.map.originOffsetX, Game.map.originOffsetY);
      this.pos = windowCoords.add(offset);
      this.config.stationary = true;
    } else if (this.config.sprite) {
      var sprite = this.config.sprite;
      var points = sprite.transformedPoints();
      var x = 0;
      var y = 0;
      var min = points[0].clone();
      var max = points[0].clone();
      var length = points.length;
      for (var i = 0; i < length; i++) {
        var point = points[i];
        x += point.x;
        y += point.y;
        min.x = Math.min(point.x, min.x);
        min.y = Math.min(point.y, min.y);
        max.x = Math.max(point.x, max.x);
        max.y = Math.max(point.y, max.y);
      }
      xoffset = Math.round((max.x - min.x) / 2);
      yoffset = Math.round((max.y - min.y) / 2);
      this.pos = Vector.create(x, y);
      this.pos.scale(1 / length);
    } else {
      this.pos = this.config.pos.clone();
    }

    this.pos.retain();

    this.pos.rot = 0;
    this.life    = this.config.duration;
    this.opacity = this.config.fadeDuration > 0 ? 0 : this.config.opacity;

    if (this.config.tail === 'top') {
      this.isTop = true;
    } else if (this.config.tail === 'bottom') {
      this.isTop = false;
    } else if (Game.dude) {
      this.isTop = Game.dude.pos.subtract(this.pos).y < 0;
    }

    this.createNode();
    this.setText(this.config.text);

    if (this.config.id) {
      this.node.attr('id', this.config.id);
    }

    this.center = {
      x: this.node.outerWidth() / 2,
      y: this.node.outerHeight() + 10
    };

    if (this.isTop) {
      this.center.y = -10 - yoffset;
    } else {
      this.center.y += yoffset;
    }

    if (this.config.stationary) {
      // render once to put it in place
      this.render(0.01);
      // override render with our stationary one
      this.render = this.stationaryRender;
    }

    this.offset = Vector.create(0, 0);
    this.offset.retain();
  };
  Hint.prototype = new Sprite();
  Hint.prototype.fx           = true;
  Hint.prototype.stationary   = true;

  Hint.prototype.z            = 600;

  Hint.prototype.createNode = function () {
    this.node = $('<div/>').addClass('tip');
    if (this.config.tail) {
      this.node.addClass(this.isTop ? 'top' : 'bottom');
    }
    if (this.config.tailSide) {
      this.node.addClass(this.config.tailSide);
    }
    if (this.config.clickable) {
      this.node.addClass('clickable');
    }
    // so it doesn't pop in the upper left corner
    // before it appears where it's supposed to be
    this.node[0].style.opacity = 0;
    this.spriteParent.append(this.node);
  };

  Hint.prototype.draw = function (delta) {
    var duration = this.config.fadeDuration;
    var final    = this.config.opacity;
    if (this.life !== null && this.life < 0) {
      this.opacity = (duration + this.life) / duration;
    } else if (this.opacity < final) {
      this.opacity += delta / duration;
      if (this.opacity > final) {
        this.opacity = final;
      }
    }

    if (this.config.throb) {
      this.scale = 1 + Math.sin(5 * Math.PI * this.life / this.config.duration) / 20;
    }
  };

  Hint.prototype.postMove = function (delta) {
    if (this.life !== null) {
      this.life -= delta;
      if (this.life < -this.config.fadeDuration) {
        this.die();
        if (this.config.callback) {
          this.config.callback();
        }
      }
    }
  };

  Hint.prototype.setText = function (text) {
    if (this.node) {
      this.node.html(text);
    }
  };

  Hint.prototype.cleanupDomNodes = function () {
    if (this.node) {
      this.node.remove();
      this.node = null;
    }
  };

  Hint.prototype.die = function () {
    Sprite.prototype.die.call(this);
    currentHints.splice(currentHints.indexOf(this), 1);
  };

  Hint.prototype.dismiss = function (duration) {
    this.life = this.config.fadeDuration * (this.opacity - this.config.opacity);
    if (duration) {
      this.config.fadeDuration = duration;
    }
  };

  Hint.prototype.stationaryRender = function (delta) {
    // update opacity
    this.draw(delta);
    this.node[0].style.opacity = this.opacity;
  };

  return {
    create: function (config) {
      var hint = new Hint(config);
      currentHints.push(hint);
      Game.sprites.push(hint);
      return hint;
    },
    dismissAll: function (duration) {
      _.invoke(currentHints, 'dismiss', duration);
    }
  };
});
