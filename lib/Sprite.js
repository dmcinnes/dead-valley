// Sprite

define(["Game", "Console", "Matrix", "Vector", "EventMachine", "SpriteMarshal", "sprite-info"],
       function (Game, Console, Matrix, Vector, EventMachine, SpriteMarshal, spriteInfo) {

  var transformKey       = Modernizr.prefixed('transform');
  var transformOriginKey = Modernizr.prefixed('transformOrigin');

  var spriteID = 0;

  Matrix  = new Matrix(2, 3);

  var bulletHit;

  var Sprite = function () {
    this.visible  = true;
    this.reap     = false;

    this.collidable = false;

    this.scale = 1;

    this.currentNode = null;
    this.nextsprite  = null;
  };

  // where the sprites live
  Sprite.prototype.spriteParent = $('#sprites');

  // this sprite should be saved when the level chunk in reclaimed
  Sprite.prototype.shouldSave = true;

  Sprite.prototype.init = function (name) {
    var i;
    // can init with an object, otherwise look it up
    var config = _.isObject(name) ? name : spriteInfo[name];

    if (!config) {
      Console.error("Sprite config for '"+name+"' does not exist!");
    }

    this.name  = config.name || name;
    this.clazz = _.isObject(name) ? this.name : name.replace(/\d+$/, ''); // numbers at the end denote types

    var co;
    if (config.collidableOffset) {
      co = config.collidableOffset;
    } else {
      // if not configured assume it's centered
      co = Vector.create(config.width / 2, config.height / 2);
    }
    this.points = [
      Vector.create(-co.x, -co.y, true),
      Vector.create( co.x, -co.y, true),
      Vector.create( co.x,  co.y, true),
      Vector.create(-co.x,  co.y, true)
    ];

    this.calculateNormals();

    // current points and normals that have been transformed by
    // the current position and rotation state
    this.transPoints  = [];
    this.transNormals = [];
    for (i = 0; i < this.points.length; i++) {
      this.transPoints[i] = this.points[i].clone();
      this.transPoints[i].retain();
      this.transNormals[i] = this.normals[i].clone();
      this.transNormals[i].retain();
    }
    this.clearCurrentPointsAndNormals(); // set dirty

    // assuming horizontal tiles
    this.tileWidth  = config.width;
    this.tileHeight = config.height;

    // cloned so we can manipulate it on a per-sprite instance basis
    this.imageOffset = $.extend({x:0, y:0}, config.imageOffset);
    this.center      = $.extend({x:0, y:0}, config.center);

    this.image = config.img;
    this.color = config.color;

    // load the image
    var imageName = this.image;
    if (this.color) {
      imageName += '-' + this.color;
    }
    Game.assetManager.loadImage(imageName, $.proxy(function (img) {
      this.imageData = img;
    }, this));

    this.pos = Vector.create(0, 0, true);
    this.pos.rot = 0;

    this.vel = Vector.create(0, 0, true);
    this.vel.rot = 0;

    this.acc = Vector.create(0, 0, true);
    this.acc.rot = 0;

    // where the sprite is on the grid
    this.gridCoords = Vector.create(0, 0, true);

    // sprites default to a z-index of 100
    this.z = config.z || 100;

    this.opacity = 1;

    this.inertia = 80;

    this.layers = [];
    this.lastLayers = [];
    var layerCount = config.layers || 1;
    for (i = 0; i < layerCount; i++) {
      this.layers.push(0);
    }

    // how much to push the image over for each tile
    // -- defaults to sprite width
    this.tileOffset = config.tileOffset || this.tileWidth;

    this.layerCount = layerCount;

    // list of nodes associated with this sprite
    // -- so we can clean them up when the sprite is dead
    this.associatedDomNodes = [];

    Sprite.newID(this);

    this.node = this.createNode(layerCount);
  };

  Sprite.prototype.setColor = function (color) {
    this.color = color;
    this.updateBackgroundImages();
  };

  Sprite.prototype.calculateNormals = function () {
    var p1, p2, n, i;

    this.normals = [];

    for (i = 1; i < this.points.length; i++) {
      p1 = this.points[i-1];
      p2 = this.points[i];

      n = p1.subtract(p2).normal().normalize();

      n.retain();

      this.normals.push(n);
    }

    p1 = this.points[this.points.length-1];
    p2 = this.points[0];

    n = p1.subtract(p2).normal().normalize();
    n.retain();

    this.normals.push(n);
  };
  
  Sprite.prototype.createNode = function (layers) {
    var node = $('<div/>');

    node.css({
      'opacity': this.opacity,
      width: this.tileWidth,
      height: this.tileHeight
    });

    node.css(transformOriginKey, this.center.x + 'px ' + this.center.y + 'px');

    this.updateBackgroundImages(node, layers);

    node.addClass('sprite');
    this.spriteParent.append(node);

    this.associatedDomNodes.push(node);

    node.data('sprite-id', this.id);

    return node;
  };

  Sprite.prototype.updateBackgroundImages = function (node, layers) {
    layers = layers || this.layerCount;
    node   = node   || this.node;

    var imageName = this.image;
    if (this.color) {
      imageName += '-' + this.color;
    }

    var imageUrl = Game.assetManager.imageUrl(imageName);
    var image = [];
    for (var i = 0; i < layers; i++) {
      image.push("url(\""+imageUrl+"\")");
    }

    node.css('background-image', image.join(','));
  };

  Sprite.prototype.preMove  = function () {
  };

  Sprite.prototype.postMove = function () {
  };

  Sprite.prototype.clearCurrentPointsAndNormals = function () {
    this.transPoints.dirty  = true;
    this.transNormals.dirty = true;
  };

  // perform a speculativeMove -- lets see where he's going next frame
  Sprite.prototype.speculativeMove = function (delta) {
    if (!this.stationary) {
      // clear the cached calculated points and normals
      this.clearCurrentPointsAndNormals();

      // save current position
      this.oldPos     = this.pos.clone();
      this.oldPos.rot = this.pos.rot;
      this.oldPos.retain();

      // figure out where he's going to be at the current velocity
      this.pos.x   += this.vel.x   * delta;
      this.pos.y   += this.vel.y   * delta;
      this.pos.rot += this.vel.rot * delta;

      // update grid location with new pos
      this.updateGrid();
    }
  };

  Sprite.prototype.restorePreSpeculativePosition = function () {
    // restore original position and rotation
    if (this.oldPos) {
      this.pos.free();
      this.pos = this.oldPos;
      this.oldPos = null;
    }
  };

  Sprite.prototype.integrate = function (delta) {
    this.vel.x   += this.acc.x   * delta;
    this.vel.y   += this.acc.y   * delta;
    this.vel.rot += this.acc.rot * delta;
    this.pos.x   += this.vel.x   * delta;
    this.pos.y   += this.vel.y   * delta;
    this.pos.rot += this.vel.rot * delta;

    // zero is zero
    if (Math.abs(this.pos.rot) < 1.0e-5) {
      this.pos.rot = 0;
    }

    // cleanup
    this.clearCurrentPointsAndNormals();
    this.updateGrid();
    this.updateForVerticalZ();
  };

  Sprite.prototype.transformedNormals = function () {
    if (!this.transNormals.dirty) {
      return this.transNormals;
    }
    this.transNormals.dirty = false;
    var norms = this.transNormals;

    // only rotate
    Matrix.configure(this.pos.rot, 1.0, 0, 0);

    var length = this.normals.length;
    for (var i = 0; i < length; i++) {
      Matrix.vectorMultiply(this.normals[i], norms[i]);
    }
    return norms;
  };

  var collideRangeWidth  = Game.GameWidth / 2;
  var collideRangeHeight = Game.GameHeight / 2;

  Sprite.prototype.inCollideRange = function () {
    x = this.pos.x - Game.map.originOffsetX;
    y = this.pos.y - Game.map.originOffsetY;

    return !(x + collideRangeWidth  < 0 ||
             y + collideRangeHeight < 0 ||
             x - collideRangeWidth  > Game.GameWidth ||
             y - collideRangeHeight > Game.GameHeight);
  };

  Sprite.prototype.updateCollideState = function () {
    this.collideRange = this.inCollideRange();
  };

  Sprite.prototype.isInRenderRange = function () {
    var x = this.pos.x - Game.map.originOffsetX;
    var y = this.pos.y - Game.map.originOffsetY;

    return !(x + this.tileWidth < 0 ||
             y + this.tileHeight < 0 ||
             x - this.tileWidth > Game.GameWidth ||
             y - this.tileHeight > Game.GameHeight);
  };

  Sprite.prototype.updateRenderState = function () {
    var should = this.isInRenderRange();

    if (this.node) {
      if (should && !this.onScreen) {
        // entering the screen
        this.node.css('visibility', 'visible');
      } else if (!should && this.onScreen) {
        // exiting the screen
        this.node.css('visibility', 'hidden');
      }
    }

    this.onScreen = should;
  };

  Sprite.prototype.render = function (delta) {
    if (!this.node || this.node.length === 0) {
      Console.log("render called on sprite with no node!", this);
      return;
    }

    // clear layers
    if (this.layers) {
      var count = this.layers.length;
      for (var i = 0; i < count; i++) {
        this.layers[i] = -1;
      }
    }

    var style = this.node[0].style;

    var x = this.pos.x - Game.map.originOffsetX;
    var y = this.pos.y - Game.map.originOffsetY;

    this.draw(delta);

    var transform = ' translate(' + -this.center.x + 'px,' + -this.center.y + 'px)' +
                    ' translate(' + x + 'px,' + y + 'px)' +
                    ' rotate(' + this.pos.rot + 'deg)';
    if (this.direction) {
      transform += ' scaleX(-1)';
    }

    if (Game.threeDee) {
      transform += ' translateZ(' + this.z + 'px)';
    } else {
      // setting z-index every frame is really slow
      // update z
      style.zIndex = this.z;
    }

    if (this.scale !== 1) {
      transform += ' scale(' + this.scale + ')';
    }

    // set the transform
    style[transformKey] = transform;

    // update opacity
    style.opacity = this.opacity;

    this.finalizeLayers();
  };

  // default draw method, just draw the 0th tile
  Sprite.prototype.draw = function (delta) {
    this.drawTile(0, 0);
  };

  Sprite.prototype.updateGrid = function () {
    if (this.fx || this.reap) {
      return;
    }
    if (!this.currentNode) {
      this.gridCoords.set(0, 0);
    }

    var newNode = Game.map.updateWorldCoords(this.pos, this.gridCoords);

    // we're off the the part of the world loaded into memory
    if (newNode === null) {
      this.die();
      return;
    }

    if (newNode) {
      if (this.currentNode) {
        this.currentNode.leave(this);
      }
      newNode.enter(this);
      this.currentNode = newNode;
      this.adjacentNodes = null; // clear current adjacent list
    }
  };

  Sprite.prototype.collision = function () {
  };

  Sprite.prototype.hide = function () {
    this.visible = false;
    this.onScreen = false;
    this.node.hide();
    this.node.css('visibility', 'hidden');
  };

  Sprite.prototype.show = function () {
    this.visible = true;
    this.node.show();
    this.updateRenderState();
    this.render(0); // so position is updated
  };

  Sprite.prototype.cleanupDomNodes = function () {
    _.each(this.associatedDomNodes, function (node) {
      node.remove();
    });
  };

  Sprite.prototype.cleanupVectors = function () {
    if (this.vel) {
      this.vel.free();
    }
    if (this.acc) {
      this.acc.free();
    }
    if (this.points) {
      var length = this.points.length;
      for (var i; i < length; i++) {
	this.points[i].free();
	this.normals[i].free();
	this.transPoints[i].free();
	this.transNormals[i].free();
      }
    }
  };

  Sprite.prototype.die = function () {
    this.reap = true;
    if (this.currentNode) {
      this.currentNode.leave(this);
      this.currentNode = null;
    }
    this.cleanupDomNodes();
    this.cleanupVectors();
  };

  Sprite.prototype.transformedPoints = function () {
    if (!this.transPoints.dirty) {
      return this.transPoints;
    }
    this.transPoints.dirty = false;
    var trans = this.transPoints;
    Matrix.configure(this.pos.rot, this.scale, this.pos.x, this.pos.y);
    var count = this.points.length;
    for (var i = 0; i < count; i++) {
      Matrix.vectorMultiply(this.points[i], trans[i]);
    }
    return trans;
  };

  Sprite.prototype.isClear = function (pos) {
    pos = pos || this.pos;
    var cn = this.currentNode;
    if (cn === null) {
      var gridx = Math.floor(pos.x / Game.gridsize);
      var gridy = Math.floor(pos.y / Game.gridsize);
      gridx = (gridx >= Game.map.grid.length) ? 0 : gridx;
      gridy = (gridy >= Game.map.grid[0].length) ? 0 : gridy;
      cn = Game.map.grid[gridx][gridy];
    }
    return (cn.isEmpty(this.collidesWith) &&
            cn.north.isEmpty(this.collidesWith) &&
            cn.south.isEmpty(this.collidesWith) &&
            cn.east.isEmpty(this.collidesWith) &&
            cn.west.isEmpty(this.collidesWith) &&
            cn.north.east.isEmpty(this.collidesWith) &&
            cn.north.west.isEmpty(this.collidesWith) &&
            cn.south.east.isEmpty(this.collidesWith) &&
            cn.south.west.isEmpty(this.collidesWith));
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
    var length = this.layers.length;
    for (var i = length-1; i >= 0; i--) {
      var index = this.layers[i];
      if (index >= 0) {
        var left = (index * this.tileOffset) + this.imageOffset.x;
        var top  = this.imageOffset.y;
        context.drawImage(this.imageData,
                          left, top, this.tileWidth, this.tileHeight,
                          0, 0, this.tileWidth, this.tileHeight);
      }
    }
  };

  Sprite.prototype.nearby = function () {
    if (this.currentNode === null) return [];
    return _(this.currentNode.nearby()).without(this);
  };

  Sprite.prototype.distance = function (other) {
    return Math.sqrt(Math.pow(other.pos.x - this.pos.x, 2) + Math.pow(other.pos.y - this.pos.y, 2));
  };

  // take a relative Vector and make it a world Vector
  Sprite.prototype.relativeToWorld = function (relative) {
    Matrix.configure(this.pos.rot, 1.0, 0, 0);
    return Matrix.vectorMultiply(relative);
  };
  // take a world Vector and make it a relative Vector
  Sprite.prototype.worldToRelative = function (world) {
    Matrix.configure(-this.pos.rot, 1.0, 0, 0);
    return Matrix.vectorMultiply(world);
  };

  Sprite.prototype.saveMetadata = function () {
    this.pos.round();
    return {
      clazz: this.clazz,
      type:  this.name,
      pos:   this.pos
    };
  };

  Sprite.prototype.bulletHit = function (hit, damage) {
    if (!bulletHit) {
      require(["fx/BulletHit"], function (BulletHit) {
        bulletHit = new BulletHit();
        bulletHit.fireSparks(hit);
      });
    } else {
      bulletHit.fireSparks(hit);
    }
  };

  // set the z value based on the vertical position on the page
  Sprite.prototype.updateForVerticalZ = function () {
    // update anything between 100 and 200
    if (this.z >= 100 && this.z < 200) {
      var vert = (this.pos.y - Game.map.originOffsetY) / Game.GameHeight;
      if (vert > 0 && vert < 1) {
        this.z = Math.round(vert * 100) + 100;
      }
    }
  };

  // called after spawned
  Sprite.prototype.spawned = function () {
  };

  SpriteMarshal(Sprite);
  EventMachine(Sprite);
  
  // pre-load sprite images
  _.each(spriteInfo, function (sprite) {
    var img = sprite.img;

    if (sprite.color) {
      img += '-' + sprite.color;
    }

    Game.assetManager.loadImage(img);
  });

  Sprite.newID = function (sprite) {
    sprite.id = spriteID++;
  };

  return Sprite;
});
