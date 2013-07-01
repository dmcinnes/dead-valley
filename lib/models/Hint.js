define(['Game', 'SpriteModel', 'Vector'], function (Game, SpriteModel, Vector) {

  var currentHints = [];

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
    id:            null,   // what ID to give this hint
    name:          'Hint', // this class
    z:             600
  };

  var Hint = function (config) {
    this.config = _.defaults(config, defaults);
    this.init(config);

    this.xoffset = 0;
    this.yoffset = 0;

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
      this.xoffset = Math.round((max.x - min.x) / 2);
      this.yoffset = Math.round((max.y - min.y) / 2);
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

    this.offset = Vector.create(0, 0);
    this.offset.retain();
  };
  Hint.prototype = new SpriteModel();
  Hint.prototype.fx         = true;
  Hint.prototype.stationary = true;

  Hint.prototype.preMove = function (delta) {
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

  Hint.prototype.die = function () {
    SpriteModel.prototype.die.call(this);
    currentHints.splice(currentHints.indexOf(this), 1);
  };

  Hint.prototype.dismiss = function (duration) {
    this.life = this.config.fadeDuration * (this.opacity - this.config.opacity);
    if (duration) {
      this.config.fadeDuration = duration;
    }
  };

  return {
    create: function (config) {
      var hint = new Hint(config);
      currentHints.push(hint);
      Game.addSprite(hint);
      return hint;
    },
    dismissAll: function (duration) {
      _.invoke(currentHints, 'dismiss', duration);
    }
  };
});
