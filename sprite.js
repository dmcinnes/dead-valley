// Sprite 

define(["game", "matrix", "vector"], function (game, Matrix, Vector) {

  var matrix   = new Matrix(2, 3);
  var context  = game.spriteContext;

  var Sprite = function () {
    var newNode, i, j, normals, trans, points, dot, count, px, py, nx, ny, min, max, we, they;

    this.init = function (name, width, height, image) {
      this.name     = name;

      var halfWidth  = width / 2;
      var halfHeight = height / 2;
      this.points   = new Array(4);
      this.points[0] = new Vector(-halfWidth, -halfHeight);
      this.points[1] = new Vector( halfWidth, -halfHeight);
      this.points[2] = new Vector( halfWidth,  halfHeight);
      this.points[3] = new Vector(-halfWidth,  halfHeight);

      this.image    = image;

      // assuming horizontal tiles
      this.tileWidth  = width;
      this.tileHeight = height;

      this.pos = new Vector(0, 0);
      this.pos.rot = 0;

      this.vel = new Vector(0, 0);
      this.vel.rot = 0;

      this.acc = new Vector(0, 0);
      this.acc.rot = 0;

      // for now we're going to assume all sprites are boxes
      // TODO calculate the normals for arbitrary shapes
      this.normals = [
        new Vector(1, 0),
        new Vector(0, 1)
      ];

      this.currentNormals = [
        new Vector(1, 0),
        new Vector(0, 1)
      ];
    };

    this.children = {};

    this.visible  = false;
    this.reap     = false;

    this.collidesWith = [];

    this.scale = 1;

    this.currentNode = null;
    this.nextSprite  = null;

    this.preMove  = null;
    this.postMove = null;

    this.run = function(delta) {
      this.transPoints = null; // clear cached points
      this.move(delta);
      this.transformNormals();
      this.updateGrid();
      this.checkCollisionsAgainst(this.findCollisionCanidates());
    };
    this.move = function (delta) {
      if (!this.visible) return;

      if (this.preMove) {
        this.preMove(delta);
      }

      this.vel.x   += this.acc.x   * delta;
      this.vel.y   += this.acc.y   * delta;
      this.vel.rot += this.acc.rot * delta;
      this.pos.x   += this.vel.x   * delta;
      this.pos.y   += this.vel.y   * delta;
      this.pos.rot += this.vel.rot * delta;
      if (this.pos.rot > 360) {
        this.pos.rot -= 360;
      } else if (this.pos.rot < 0) {
        this.pos.rot += 360;
      }

      if (this.postMove) {
        this.postMove(delta);
      }
    };
    this.transformNormals = function () {
      // only rotate
      matrix.configure(this.pos.rot, 1.0, 0, 0);
      for (i = 0; i < this.normals.length; i++) {
        this.currentNormals[i] = matrix.vectorMultiply(this.normals[i]);
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
      newNode = game.map.getNodeByWorldCoords(this.pos.x, this.pos.y);

      // we're off the the part of the world loaded into memory
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

      var rad = (this.pos.rot * Math.PI)/180;

      context.translate(this.pos.x, this.pos.y);
      context.translate(-game.map.originOffsetX, -game.map.originOffsetY);
      context.rotate(rad);
      context.scale(this.scale, this.scale);
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
      return canidates;
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
    // TODO figure out collidible sprite pairs first
    // and eliminate duplicates before running
    // checkCollision
    this.checkCollision = function (other) {
      if (!other.visible ||
           this == other ||
           this.collidesWith.indexOf(other.name) == -1) return;

      normals = this.currentNormals.concat(other.currentNormals);

      for (i = 0; i < normals.length; i++) {
        we   = this.lineProjection(normals[i]);
        they = other.lineProjection(normals[i]);
        if (we[1] < they[0] || we[0] > they[1]) {
          return; // no collision!
        }
      }
      // other.collision(this);
      this.collision(other);
    };
    this.lineProjection = function (normal) {
      min = Number.MAX_VALUE;
      max = -Number.MAX_VALUE;
      points = this.transformedPoints();
      count = points.length;
      for (j = 0; j < count; j++) {
        dot = normal.dotProduct(points[j]);
        min = Math.min(min, dot);
        max = Math.max(max, dot);
      }
      return [min, max];
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
    // TODO perhaps cache transPoints vectors?
    this.transformedPoints = function () {
      if (this.transPoints) return this.transPoints;
      trans = new Array(this.points.length);
      matrix.configure(this.pos.rot, this.scale, this.pos.x, this.pos.y);
      var count = this.points.length;
      for (var i = 0; i < count; i++) {
        trans[i] = matrix.vectorMultiply(this.points[i]);
      }
      this.transPoints = trans; // cache translated points
      return trans;
    };
    this.isClear = function () {
      if (this.collidesWith.length == 0) return true;
      var cn = this.currentNode;
      if (cn == null) {
        var gridx = Math.floor(this.pos.x / game.gridSize);
        var gridy = Math.floor(this.pos.y / game.gridSize);
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
                        this.points[0].x,
                        this.points[0].y,
                        this.tileWidth,
                        this.tileHeight);
      if (flipped) {
        context.restore();
      }
    };
    this.nearby = function () {
      if (this.currentNode == null) return [];
      return _(this.currentNode.nearby()).without(this);
    };
    this.distance = function (other) {
      return Math.sqrt(Math.pow(other.pos.x - this.pos.x, 2) + Math.pow(other.pos.y - this.pos.y, 2));
    };
    // take a relative vector and make it a world vector
    this.relativeToWorld = function (relative) {
      matrix.configure(this.pos.rot, 1.0, 0, 0);
      return matrix.vectorMultiply(relative);
    };
    // take a world vector and make it a relative vector
    this.worldToRelative = function (world) {
      matrix.configure(-this.pos.rot, 1.0, 0, 0);
      return matrix.vectorMultiply(world);
    };
    //velocity of a point on body
    this.pointVel = function (worldOffset) {
      var tangent = new Vector(-worldOffset.y, worldOffset.x);
      tangent.scale(this.vel.rot).translate(this.vel);
      return tangent;
    };
  };

  return Sprite;
});
