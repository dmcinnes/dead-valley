// Sprite

define(["game", "matrix", "vector"], function (game, Matrix, Vector) {

  var matrix   = new Matrix(2, 3);
  var context  = game.spriteContext;

  var Sprite = function () {

    this.init = function (config) {
      this.name   = config.name;

      var halfWidth  = config.width / 2;
      var halfHeight = config.height / 2;

      this.points    = new Array(4);
      this.points[0] = new Vector(-halfWidth, -halfHeight);
      this.points[1] = new Vector( halfWidth, -halfHeight);
      this.points[2] = new Vector( halfWidth,  halfHeight);
      this.points[3] = new Vector(-halfWidth,  halfHeight);

      this.image    = config.image;

      // assuming horizontal tiles
      this.tileWidth  = config.width;
      this.tileHeight = config.height;

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

    this.collidable = false;

    this.scale = 1;

    this.currentNode = null;
    this.nextSprite  = null;

    this.preMove  = function () {
    };

    this.postMove = function () {
    };

    this.run = function (delta) {
      this.transPoints = null; // clear cached points
      this.preMove(delta);
      this.move(delta);
      this.postMove(delta);
      this.transformNormals();
      this.updateGrid();
    };

    this.move = function (delta) {
      if (!this.visible) return;

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
    };

    // TODO: cache these
    this.transformNormals = function () {
      // only rotate
      matrix.configure(this.pos.rot, 1.0, 0, 0);
      for (var i = 0; i < this.normals.length; i++) {
        this.currentNormals[i] = matrix.vectorMultiply(this.normals[i]);
      }
    };

    this.render = function (delta) {
      if (!this.visible) return;

      context.save();
      this.configureTransform(context);
      this.draw(delta);

      context.restore();
    };

    this.updateGrid = function () {
      if (!this.visible) return;
      var newNode = game.map.getNodeByWorldCoords(this.pos.x, this.pos.y);

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

    this.configureTransform = function (ctx) {
      if (!this.visible) return;

      var rad = (this.pos.rot * Math.PI)/180;

      ctx.translate(this.pos.x, this.pos.y);
      ctx.translate(-game.map.originOffsetX, -game.map.originOffsetY);
      ctx.rotate(rad);
      ctx.scale(this.scale, this.scale);
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
      var trans = new Array(this.points.length);
      matrix.configure(this.pos.rot, this.scale, this.pos.x, this.pos.y);
      var count = this.points.length;
      for (var i = 0; i < count; i++) {
        trans[i] = matrix.vectorMultiply(this.points[i]);
      }
      this.transPoints = trans; // cache translated points
      return trans;
    };

    this.isClear = function () {
      if (!this.collidable) return true;
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
  };

  return Sprite;
});
