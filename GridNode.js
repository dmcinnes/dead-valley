// GridNode

define(["Game",
        "Vector",
        "TileMarshal"],
        function (Game, Vector, TileMarshal) {

  var background = $('#background');

  var GridNode = function (map) {
    this.map = map;

    this.north = null;
    this.south = null;
    this.east  = null;
    this.west  = null;

    this.nextSprite = null;

    // this.tileOffset = Math.floor(Math.random()*2) + 1;
    // this.tileOffset = (Math.random() > 0.9) ? Math.floor(Math.random()*6) + 1 : 0;
    this.tileOffset = 0;

    // this.tileFlip = (Math.random() > 0.5);
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

  GridNode.prototype.render = function (delta, x, y) {
    // nothing to render, return
    if (this.tileOffset === 0) return;

    if (x < -Game.gridSize || y < -Game.gridSize ||
        x > Game.GameWidth ||
        y > Game.GameHeight) {
      // outside of the view
      if (this.domNode) this.freeDomNode();
    } else {
      if (!this.domNode) this.obtainDomNode();

      var transform = ['translate(', x, 'px,', y, 'px)'];
      if (this.tileFlip) {
        transform.push(' scaleX(-1)');
      }
      if (this.tileRotate) {
        transform.push(' rotate(', this.tileRotate * 90, 'deg)');
      }

      // translateZ(0) makes a big difference for Safari
      if (Game.threeDee) {
        transform.push(' translateZ(0px)');
      }

      // TODO support FF
      this.domNode.css('-moz-transform', transform.join(''));
    }
  };

  GridNode.prototype.obtainDomNode = function () {
    if (this.map.freeNodes.length) {
      this.domNode = this.map.freeNodes.pop();
    } else {
      this.domNode = $('<div/>');
      background.append(this.domNode);
    }

    // clear all other classes
    this.domNode.attr('class', 'tile');

    // set background offset for which tile we have
    var left = -(this.tileOffset % Game.tileRowSize) * Game.gridSize;
    var top  = -Math.floor(this.tileOffset / Game.tileRowSize) * Game.gridSize;
    this.domNode.css({
      'background-position': [left, 'px ', top, 'px'].join(''),
      'visibility': 'visible'
    });
  };

  GridNode.prototype.freeDomNode = function (delta) {
    this.domNode.css('visibility', 'hidden');
    this.map.freeNodes.push(this.domNode);
    this.domNode = null;
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

  Game.assetManager.loadImage('tiles', function (image) {
    GridNode.prototype.tiles = image;
  });

  // mixins
  TileMarshal(GridNode);

  return GridNode;
});
