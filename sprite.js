// Sprite 

define(["game", "matrix"], function (game, Matrix) {

  var matrix   = new Matrix(2, 3);
  var context  = game.spriteContext;

  var Sprite = function () {
    var newNode;

    this.init = function (name, points, image, tileWidth, tileHeight) {
      this.name     = name;
      this.points   = points;
      this.image    = image;
      // assuming horizontal tiles
      this.tileWidth  = tileWidth;
      this.tileHeight = tileHeight;

      this.vel = {
        x:   0,
        y:   0,
        rot: 0
      };

      this.acc = {
        x:   0,
        y:   0,
        rot: 0
      };
    };

    this.children = {};

    this.visible  = false;
    this.reap     = false;

    this.collidesWith = [];

    this.x     = 0;
    this.y     = 0;
    this.rot   = 0;
    this.scale = 1;

    this.currentNode = null;
    this.nextSprite  = null;

    this.preMove  = null;
    this.postMove = null;

  this.run = function(delta) {
    this.move(delta);
    this.updateGrid();
  };
  this.move = function (delta) {
    if (!this.visible) return;
    this.transPoints = null; // clear cached points

    if ($.isFunction(this.preMove)) {
      this.preMove(delta);
    }

    this.vel.x   += this.acc.x * delta;
    this.vel.y   += this.acc.y * delta;
    this.vel.rot += this.acc.rot * delta;
    this.x += this.vel.x * delta;
    this.y += this.vel.y * delta;
    this.rot += this.vel.rot * delta;
    if (this.rot > 360) {
      this.rot -= 360;
    } else if (this.rot < 0) {
      this.rot += 360;
    }

    if ($.isFunction(this.postMove)) {
      this.postMove(delta);
    }
  };
  this.render = function (delta) {
    if (!this.visible) return;

    context.save();
    this.configureTransform();
    this.draw(delta);

    context.restore();
  };
  this.updateGrid = function () {
    if (!this.visible) return;
    newNode = game.map.getNodeByWorldCoords(this.x, this.y);

    // we're off the screen
    if (!newNode) {
      this.die();
      return;
    }

    if (newNode != this.currentNode) {
      if (this.currentNode) {
        this.currentNode.leave(this);
      }
      newNode.enter(this);
      this.currentNode = newNode;
    }
  };
  this.configureTransform = function () {
    if (!this.visible) return;

    var rad = (this.rot * Math.PI)/180;

    context.translate(this.x, this.y);
    context.translate(-game.map.originOffsetX, -game.map.originOffsetY);
    context.rotate(rad);
    context.scale(this.scale, this.scale);
  };
  this.draw = function () {
    if (!this.visible) return;

    context.lineWidth = 1.0 / this.scale;

    for (child in this.children) {
      this.children[child].draw();
    }

    context.beginPath();

    context.moveTo(this.points[0], this.points[1]);
    for (var i = 1; i < this.points.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      context.lineTo(this.points[xi], this.points[yi]);
    }

    context.closePath();
    context.stroke();
  };
  this.findCollisionCanidates = function () {
    if (!this.visible || !this.currentNode) return [];
    var cn = this.currentNode;
    var canidates = [];
    if (cn.nextSprite) canidates.push(cn.nextSprite);
    if (cn.north.nextSprite) canidates.push(cn.north.nextSprite);
    if (cn.south.nextSprite) canidates.push(cn.south.nextSprite);
    if (cn.east.nextSprite) canidates.push(cn.east.nextSprite);
    if (cn.west.nextSprite) canidates.push(cn.west.nextSprite);
    if (cn.north.east.nextSprite) canidates.push(cn.north.east.nextSprite);
    if (cn.north.west.nextSprite) canidates.push(cn.north.west.nextSprite);
    if (cn.south.east.nextSprite) canidates.push(cn.south.east.nextSprite);
    if (cn.south.west.nextSprite) canidates.push(cn.south.west.nextSprite);
    return canidates
  };
  this.checkCollisionsAgainst = function (canidates) {
    for (var i = 0; i < canidates.length; i++) {
      var ref = canidates[i];
      do {
        this.checkCollision(ref);
        ref = ref.nextSprite;
      } while (ref)
    }
  };
  this.checkCollision = function (other) {
    if (!other.visible ||
         this == other ||
         this.collidesWith.indexOf(other.name) == -1) return;
    var trans = other.transformedPoints();
    var px, py;
    var count = trans.length/2;
    for (var i = 0; i < count; i++) {
      px = trans[i*2];
      py = trans[i*2 + 1];
      // mozilla doesn't take into account transforms with isPointInPath >:-P
      if (($.browser.mozilla) ? this.pointInPolygon(px, py) : context.isPointInPath(px, py)) {
        other.collision(this);
        this.collision(other);
        return;
      }
    }
  };
  this.pointInPolygon = function (x, y) {
    var points = this.transformedPoints();
    var j = 2;
    var y0, y1;
    var oddNodes = false;
    for (var i = 0; i < points.length; i += 2) {
      y0 = points[i + 1];
      y1 = points[j + 1];
      if ((y0 < y && y1 >= y) ||
          (y1 < y && y0 >= y)) {
        if (points[i]+(y-y0)/(y1-y0)*(points[j]-points[i]) < x) {
          oddNodes = !oddNodes;
        }
      }
      j += 2
      if (j == points.length) j = 0;
    }
    return oddNodes;
  };
  this.collision = function () {
  };
  this.die = function () {
    this.visible = false;
    this.reap = true;
    if (this.currentNode) {
      this.currentNode.leave(this);
      this.currentNode = null;
    }
  };
  this.transformedPoints = function () {
    if (this.transPoints) return this.transPoints;
    var trans = new Array(this.points.length);
    matrix.configure(this.rot, this.scale, this.x, this.y);
    for (var i = 0; i < this.points.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      var pts = matrix.multiply(this.points[xi], this.points[yi], 1);
      trans[xi] = pts[0];
      trans[yi] = pts[1];
    }
    this.transPoints = trans; // cache translated points
    return trans;
  };
  this.isClear = function () {
    if (this.collidesWith.length == 0) return true;
    var cn = this.currentNode;
    if (cn == null) {
      var gridx = Math.floor(this.x / game.gridSize);
      var gridy = Math.floor(this.y / game.gridSize);
      gridx = (gridx >= game.map.grid.length) ? 0 : gridx;
      gridy = (gridy >= game.map.grid[0].length) ? 0 : gridy;
      cn = game.map.grid[gridx][gridy];
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
  this.drawTile = function (index, flipped) {
    if (flipped) {
      context.save();
      context.scale(-1, 1);
    }
    context.drawImage(this.image,
                      index * this.tileWidth,
                      0,
                      this.tileWidth,
                      this.tileHeight,
                      this.points[0],
                      this.points[1],
                      this.tileWidth,
                      this.tileHeight);
    if (flipped) {
      context.restore();
    }
  };
  this.nearby = function () {
    var cn = this.currentNode;
    if (cn == null) return [];
    return _([cn,
              cn.north,
              cn.south,
              cn.east,
              cn.west,
              cn.north.east,
              cn.north.west,
              cn.south.east,
              cn.south.west]).chain().map(function (n) {
                var spr = n.nextSprite;
                var out = [spr];
                while (spr) {
                  out.push(spr);
                  spr = spr.nextSprite;
                }
                return out;
            }).flatten().without(null).value();
    };
  };

  return Sprite;
});
