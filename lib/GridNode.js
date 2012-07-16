// GridNode

define(["Game",
        "TileMarshal"],
        function (Game, TileMarshal) {

  var transformKey = Modernizr.prefixed('transform');

  var background = $('#background');
  var context = background[0].getContext('2d');

  var freeNodes = [];

  var WIDTH     = Game.gridSize;
  var HALFWIDTH = Game.gridSize / 2;


  var GridNode = function (map) {
    this.map = map;

    this.north = null;
    this.south = null;
    this.east  = null;
    this.west  = null;

    this.leftOffset = null;
    this.topOffset  = null;

    this.nextSprite = null;

    this.tileOffset = 0;

    this.tileFlip   = false;
    this.tileRotate = 0;

    this.entrance = null;

    this.domNode = null;
  };

  GridNode.prototype.enter = function (sprite) {
    sprite.nextSprite = this.nextSprite;
    this.nextSprite = sprite;
  };

  GridNode.prototype.leave = function (sprite) {
    var ref = this;
    while (ref && (ref.nextSprite !== sprite)) {
      ref = ref.nextSprite;
    }
    if (ref) {
      ref.nextSprite = sprite.nextSprite;
      sprite.nextSprite = null;
    }
  };

  GridNode.prototype.eachSprite = function (sprite, callback) {
    var ref = this;
    while (ref.nextSprite) {
      ref = ref.nextSprite;
      callback.call(sprite, ref);
    }
  };

  GridNode.prototype.isEmpty = function (collidables) {
    var empty = true;
    var ref = this;
    while (ref.nextSprite) {
      ref = ref.nextSprite;
      empty = !(ref.visible && collidables[ref.name]);
      if (!empty) break;
    }
    return empty;
  };

  GridNode.prototype.renderNode = function (delta, x, y) {
    // nothing to render, return
    if (this.tileOffset === 0) return;

    if (x < -Game.gridSize || y < -Game.gridSize ||
        x > Game.GameWidth || y > Game.GameHeight) {
      // outside of the view
      this.freeDomNode();
    } else {
      if (!this.domNode) this.obtainDomNode();

      var transform = 'translate(' + x + 'px,' + y + 'px)';
      if (this.tileFlip) {
        transform += ' scaleX(-1)';
      }
      if (this.tileRotate) {
        transform += ' rotate(' + this.tileRotateRad + 'rad)';
      }

      if (Game.threeDee) {
        transform += ' translateZ(0px)';
      }

      this.domNode[0].style[transformKey] = transform;
    }
  };

  GridNode.prototype.renderCanvas = function (delta, x, y) {
    if (x < -Game.gridSize || y < -Game.gridSize ||
        x > Game.GameWidth || y > Game.GameHeight) {
      // outside of the view
      return;
    } else {

      context.save();

      context.translate(x+HALFWIDTH, y+HALFWIDTH);

      if (this.tileFlip) {
        context.scale(-1, 1);
      }
      if (this.tileRotate) {
        context.rotate(this.tileRotateRad);
      }

      context.translate(-HALFWIDTH, -HALFWIDTH);

      context.drawImage(this.tiles,
                        this.leftOffset, this.topOffset, WIDTH, WIDTH,
                        0, 0, WIDTH, WIDTH);

      context.restore();
    }
  };

  GridNode.prototype.obtainDomNode = function () {
    if (freeNodes.length) {
      this.domNode = freeNodes.pop();
    } else {
      this.domNode = $('<div/>');
      background.append(this.domNode);
    }

    // clear all other classes
    this.domNode.attr('class', 'tile');

    var style = this.domNode[0].style;
    style.backgroundPosition = (-this.leftOffset) + 'px ' + (-this.topOffset) + 'px';
    style.visibility = 'visible';
  };

  GridNode.prototype.freeDomNode = function () {
    if (this.domNode) {
      this.domNode[0].style.visibility = 'hidden';
      freeNodes.push(this.domNode);
      this.domNode = null;
    }
  };

  GridNode.prototype.nearby = function () {
    return _([this,
              this.north,
              this.south,
              this.east,
              this.west,
              this.north.east,
              this.north.west,
              this.south.east,
              this.south.west]).chain().map(function (n) {
                var spr = n.nextSprite;
                var out = [];
                while (spr) {
                  out.push(spr);
                  spr = spr.nextSprite;
                }
                return out;
            }).flatten().value();
  };

  // called when set by TileMarshal
  GridNode.prototype.updated = function () {
    // set background offset for which tile we have
    this.leftOffset = (this.tileOffset % Game.tileRowSize) * Game.gridSize;
    this.topOffset  = Math.floor(this.tileOffset / Game.tileRowSize) * Game.gridSize;
  };

  Game.assetManager.loadImage('tiles', function (image) {
    GridNode.prototype.tiles = image;
  });

  // mixins
  TileMarshal(GridNode);

  GridNode.prototype.render = GridNode.prototype.renderCanvas;

  return GridNode;
});
