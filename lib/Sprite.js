// Sprite

define(["Game", "Console", "sprite-info"],
       function (Game, Console, spriteInfo) {

  var transformKey       = Modernizr.prefixed('transform');
  var transformOriginKey = Modernizr.prefixed('transformOrigin');

  var Sprite = function () {
  };

  // where the sprites live
  Sprite.prototype.spriteParent = $('#sprites');

  Sprite.prototype.init = function (model) {
    this.model = model;

    config = model.config;

    // load the image
    if (model.config.img) {
      Game.assetManager.loadImage(this.imageFilename(), $.proxy(function (img) {
        this.imageData = img;
      }, this));
    }

    this.layers = [];
    this.lastLayers = [];
    var layerCount = config.layers || 1;
    for (i = 0; i < layerCount; i++) {
      this.layers.push(0);
    }

    // how much to push the image over for each tile
    // -- defaults to sprite width
    this.tileOffset = config.tileOffset || model.tileWidth;

    this.imageOffset = $.extend({x:0, y:0}, config.imageOffset);

    this.layerCount = layerCount;

    // list of nodes associated with this sprite
    // -- so we can clean them up when the sprite is dead
    this.associatedDomNodes = [];

    this.node = this.createNode(layerCount);
  };

  Sprite.prototype.createNode = function (layers) {
    var node = $('<div/>');

    var model = this.model;

    node.css({
      'opacity': model.opacity,
      width: model.tileWidth,
      height: model.tileHeight
    });

    node.css(transformOriginKey, model.center.x + 'px ' + model.center.y + 'px');

    this.updateBackgroundImages(node, layers);

    node.addClass('sprite');
    this.spriteParent.append(node);

    this.associatedDomNodes.push(node);

    node.data('sprite-id', model.id);

    return node;
  };

  Sprite.prototype.updateBackgroundImages = function (node, layers) {
    layers = layers || this.layerCount;
    node   = node   || this.node;

    if (node) {
      var imageUrl = Game.assetManager.imageUrl(this.imageFilename());
      var image = [];
      for (var i = 0; i < layers; i++) {
        image.push("url(\""+imageUrl+"\")");
      }

      node.css('background-image', image.join(','));
    }
  };

  Sprite.prototype.isInRenderRange = function () {
    var model = this.model;
    var x = model.pos.x - Game.map.originOffsetX;
    var y = model.pos.y - Game.map.originOffsetY;

    return !(x + model.tileWidth < 0 ||
             y + model.tileHeight < 0 ||
             x - model.tileWidth > Game.GameWidth ||
             y - model.tileHeight > Game.GameHeight);
  };

  Sprite.prototype.updateRenderState = function () {
    var should = this.model.visible && this.isInRenderRange();

    if (this.node) {
      if (should && !this.onScreen) {
        // entering the screen
        this.node.css('visibility', 'visible');
      } else if (!should && this.onScreen) {
        // exiting the screen
        this.node.css('visibility', 'hidden');
      }
    }

    if (this.color !== this.model.color) {
      this.color = this.model.color;
      this.updateBackgroundImages();
    }

    this.onScreen = should;
  };

  Sprite.prototype.render = function (delta) {
    if (!this.model) {
      Console.log("no model!", this);
      return;
    }
    if (!this.node || this.node.length === 0) {
      Console.log("render called on sprite with no node!", this);
      return;
    }

    var model = this.model;

    // clear layers
    if (this.layers) {
      var count = this.layers.length;
      for (var i = 0; i < count; i++) {
        this.layers[i] = -1;
      }
    }

    var style = this.node[0].style;

    var x = model.pos.x - Game.map.originOffsetX;
    var y = model.pos.y - Game.map.originOffsetY;

    this.draw(delta);

    var transform = ' translate(' + -model.center.x + 'px,' + -model.center.y + 'px)' +
                    ' translate(' + x + 'px,' + y + 'px)' +
                    ' rotate(' + model.pos.rot + 'deg)';
    if (model.direction) {
      transform += ' scaleX(-1)';
    }

    if (Game.threeDee) {
      transform += ' translateZ(' + model.z + 'px)';
    } else {
      // setting z-index every frame is really slow
      // update z
      style.zIndex = model.z;
    }

    if (model.scale !== 1) {
      transform += ' scale(' + model.scale + ')';
    }

    // set the transform
    style[transformKey] = transform;

    // update opacity
    style.opacity = model.opacity;

    this.finalizeLayers();
  };

  // default draw method, just draw the 0th tile
  Sprite.prototype.draw = function (delta) {
    this.drawTile(0, 0);
  };

  Sprite.prototype.hide = function () {
    this.onScreen = false;
    this.node.hide();
    this.node.css('visibility', 'hidden');
  };

  Sprite.prototype.show = function () {
    this.node.show();
    this.updateRenderState();
    this.render(0); // so position is updated
  };

  Sprite.prototype.cleanupDomNodes = function () {
    if (this.associatedDomNodes) {
      _.each(this.associatedDomNodes, function (node) {
        node.remove();
      });
      this.associatedDomNodes.length = 0;
    }
    if (this.node) {
      this.node.remove();
      this.node = null;
    }
  };

  Sprite.prototype.cleanup = function () {
    this.cleanupDomNodes();
  };

  Sprite.prototype.drawTile = function (index, layer) {
    // if layer is not provided assume each tile has its own layer
    var which = (layer === undefined) ? index : layer;
    this.layers[which] = index;
  };

  // take the layer data and update the background position from it
  Sprite.prototype.finalizeLayers = function () {
    // the < OR > returns true for array differences
    // http://stackoverflow.com/questions/3115982/how-to-check-javascript-array-equals
    // only update the background when it changes
    if (this.layers &&
       (this.layers < this.lastLayers || this.layers > this.lastLayers)) {
      var length   = this.layers.length;
      var position = "";
      for (var i = length-1; i >= 0; i--) {
        var index = this.layers[i];
        // save for next frame
        this.lastLayers[i] = index;

        if (index >= 0) {
          var left = -(index * this.tileOffset) - this.imageOffset.x;
          var top  = -this.imageOffset.y;
          if (position.length > 0) {
            position += ',';
          }
          position += left + 'px ' + top + 'px';
        }
      }
      this.node[0].style.backgroundPosition = position;
    }
  };

  Sprite.prototype.renderToContext = function (context) {
    var model = this.model;
    var length = this.layers.length;
    for (var i = length-1; i >= 0; i--) {
      var index = this.layers[i];
      if (index >= 0) {
        var left = (index * this.tileOffset) + this.imageOffset.x;
        var top  = this.imageOffset.y;
        context.drawImage(this.imageData,
                          left, top, model.tileWidth, model.tileHeight,
                          0, 0, model.tileWidth, model.tileHeight);
      }
    }
  };

  Sprite.prototype.imageFilename = function () {
    var imageFilename = this.model.config.img;
    if (this.model.color) {
      imageFilename += '-' + this.model.color;
    }
    return imageFilename;
  };

  // pre-load sprite images
  _.each(spriteInfo, function (sprite) {
    var img = sprite.img;

    if (sprite.color) {
      img += '-' + sprite.color;
    }

    Game.assetManager.loadImage(img);
  });

  return Sprite;
});
