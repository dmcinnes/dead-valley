KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  70: 'f',
  71: 'g',
  72: 'h',
  77: 'm',
  80: 'p'
}

KEY_STATUS = { keyDown:false };
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}

$(window).keydown(function (e) {
  KEY_STATUS.keyDown = true;
  if (KEY_CODES[e.keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[e.keyCode]] = true;
  }
}).keyup(function (e) {
  KEY_STATUS.keyDown = false;
  if (KEY_CODES[e.keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[e.keyCode]] = false;
  }
});

GRID_SIZE = 60;

Matrix = function (rows, columns) {
  var i, j;
  this.data = new Array(rows);
  for (i = 0; i < rows; i++) {
    this.data[i] = new Array(columns);
  }

  this.configure = function (rot, scale, transx, transy) {
    var rad = (rot * Math.PI)/180;
    var sin = Math.sin(rad) * scale;
    var cos = Math.cos(rad) * scale;
    this.set(cos, -sin, transx,
             sin,  cos, transy);
  };

  this.set = function () {
    var k = 0;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < columns; j++) {
        this.data[i][j] = arguments[k];
        k++;
      }
    }
  }

  this.multiply = function () {
    var vector = new Array(rows);
    for (i = 0; i < rows; i++) {
      vector[i] = 0;
      for (j = 0; j < columns; j++) {
        vector[i] += this.data[i][j] * arguments[j];
      }
    }
    return vector;
  };
};

Sprite = function () {
  this.init = function (name, points) {
    this.name     = name;
    this.points   = points;

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
  this.bridgesH = true;
  this.bridgesV = true;

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

    this.context.save();
    this.configureTransform();
    this.draw();

    var canidates = this.findCollisionCanidates();

    this.matrix.configure(this.rot, this.scale, this.x, this.y);
    this.checkCollisionsAgainst(canidates);

    this.context.restore();

    if (this.bridgesH && this.currentNode && this.currentNode.dupe.horizontal) {
      this.x += this.currentNode.dupe.horizontal;
      this.context.save();
      this.configureTransform();
      this.draw();
      this.checkCollisionsAgainst(canidates);
      this.context.restore();
      if (this.currentNode) {
        this.x -= this.currentNode.dupe.horizontal;
      }
    }
    if (this.bridgesV && this.currentNode && this.currentNode.dupe.vertical) {
      this.y += this.currentNode.dupe.vertical;
      this.context.save();
      this.configureTransform();
      this.draw();
      this.checkCollisionsAgainst(canidates);
      this.context.restore();
      if (this.currentNode) {
        this.y -= this.currentNode.dupe.vertical;
      }
    }
    if (this.bridgesH && this.bridgesV &&
        this.currentNode &&
        this.currentNode.dupe.vertical &&
        this.currentNode.dupe.horizontal) {
      this.x += this.currentNode.dupe.horizontal;
      this.y += this.currentNode.dupe.vertical;
      this.context.save();
      this.configureTransform();
      this.draw();
      this.checkCollisionsAgainst(canidates);
      this.context.restore();
      if (this.currentNode) {
        this.x -= this.currentNode.dupe.horizontal;
        this.y -= this.currentNode.dupe.vertical;
      }
    }
  };
  this.move = function (delta) {
    if (!this.visible) return;
    this.transPoints = null; // clear cached points

    if ($.isFunction(this.preMove)) {
      this.preMove(delta);
    }

    this.vel.x += this.acc.x * delta;
    this.vel.y += this.acc.y * delta;
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
  this.updateGrid = function () {
    if (!this.visible) return;
    var gridx = Math.floor(this.x / GRID_SIZE);
    var gridy = Math.floor(this.y / GRID_SIZE);
    gridx = (gridx >= this.grid.length) ? 0 : gridx;
    gridy = (gridy >= this.grid[0].length) ? 0 : gridy;
    gridx = (gridx < 0) ? this.grid.length-1 : gridx;
    gridy = (gridy < 0) ? this.grid[0].length-1 : gridy;
    var newNode = this.grid[gridx][gridy];
    if (newNode != this.currentNode) {
      if (this.currentNode) {
        this.currentNode.leave(this);
      }
      newNode.enter(this);
      this.currentNode = newNode;
    }

    if (KEY_STATUS.g && this.currentNode) {
      this.context.lineWidth = 3.0;
      this.context.strokeStyle = 'green';
      this.context.strokeRect(gridx*GRID_SIZE+2, gridy*GRID_SIZE+2, GRID_SIZE-4, GRID_SIZE-4);
      this.context.strokeStyle = 'black';
      this.context.lineWidth = 1.0;
    }
  };
  this.configureTransform = function () {
    if (!this.visible) return;

    var rad = (this.rot * Math.PI)/180;

    this.context.translate(this.x, this.y);
    this.context.rotate(rad);
    this.context.scale(this.scale, this.scale);
  };
  this.draw = function () {
    if (!this.visible) return;

    this.context.lineWidth = 1.0 / this.scale;

    for (child in this.children) {
      this.children[child].draw();
    }

    this.context.beginPath();

    this.context.moveTo(this.points[0], this.points[1]);
    for (var i = 1; i < this.points.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      this.context.lineTo(this.points[xi], this.points[yi]);
    }

    this.context.closePath();
    this.context.stroke();
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
      if (($.browser.mozilla) ? this.pointInPolygon(px, py) : this.context.isPointInPath(px, py)) {
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
    this.matrix.configure(this.rot, this.scale, this.x, this.y);
    for (var i = 0; i < this.points.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      var pts = this.matrix.multiply(this.points[xi], this.points[yi], 1);
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
      var gridx = Math.floor(this.x / GRID_SIZE);
      var gridy = Math.floor(this.y / GRID_SIZE);
      gridx = (gridx >= this.grid.length) ? 0 : gridx;
      gridy = (gridy >= this.grid[0].length) ? 0 : gridy;
      cn = this.grid[gridx][gridy];
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
  this.wrapPostMove = function () {
    if (this.x > Game.canvasWidth) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = Game.canvasWidth;
    }
    if (this.y > Game.canvasHeight) {
      this.y = 0;
    } else if (this.y < 0) {
      this.y = Game.canvasHeight;
    }
  };

};

GridNode = function (level) {
  this.level = level;

  this.north = null;
  this.south = null;
  this.east  = null;
  this.west  = null;

  this.nextSprite = null;

  this.tileOffset = Math.floor(Math.random()*2) + 1;
  // this.tileOffset = (Math.random() > 0.9) ? Math.floor(Math.random()*2) + 1 : 0;
  this.tileFlip = (Math.random() > 0.5);

  this.domNode = null;

  this.dupe = {
    horizontal: null,
    vertical:   null
  };

  this.enter = function (sprite) {
    sprite.nextSprite = this.nextSprite;
    this.nextSprite = sprite;
  };

  this.leave = function (sprite) {
    var ref = this;
    while (ref && (ref.nextSprite != sprite)) {
      ref = ref.nextSprite;
    }
    if (ref) {
      ref.nextSprite = sprite.nextSprite;
      sprite.nextSprite = null;
    }
  };

  this.eachSprite = function(sprite, callback) {
    var ref = this;
    while (ref.nextSprite) {
      ref = ref.nextSprite;
      callback.call(sprite, ref);
    }
  };

  this.isEmpty = function (collidables) {
    var empty = true;
    var ref = this;
    while (ref.nextSprite) {
      ref = ref.nextSprite;
      empty = !ref.visible || collidables.indexOf(ref.name) == -1
      if (!empty) break;
    }
    return empty;
  };

  this.render = function (delta, offsetX, offsetY) {
    if (this.tileOffset == 0) return;

    if (this.domNode) {
      this.domNode.css({left:offsetX, top:offsetY});
    } else {
      if (this.level.freeNodes.length) {
        this.domNode = this.level.freeNodes.pop();
        this.domNode.css({left:offsetX, top:offsetY, 'background-position':GRID_SIZE * this.tileOffset+' 0px'}).show();
      } else {
        this.domNode = $('<div/>', {'class':'tile'}).css({left:offsetX, top:offsetY, 'background-position':GRID_SIZE * this.tileOffset+' 0px'});
        this.background.append(this.domNode);
      }
    }
  };

  this.reclaim = function (delta) {
    if (this.domNode) {
      this.domNode.hide();
      level.freeNodes.push(this.domNode);
      this.domNode = null;
    }
  };
};

Level = function (gridWidth, gridHeight) {
  var i, j, startx, starty, endx, endy, currentx, currenty;

  this.gridWidth  = gridWidth;
  this.gridHeight = gridHeight;
  this.width  = gridWidth * GRID_SIZE;
  this.height = gridHeight * GRID_SIZE;
  this.viewportGridWidth  = Math.ceil(Game.canvasWidth / GRID_SIZE);
  this.viewportGridHeight = Math.ceil(Game.canvasHeight / GRID_SIZE);

  this.offsetX = 0;
  this.offsetY = 0;

  this.grid = new Array(gridWidth);
  this.freeNodes = [];

  for (i = 0; i < this.gridWidth; i++) {
    this.grid[i] = new Array(this.gridHeight);
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j] = new GridNode(this);
    }
  }

  // set up the positional references
  for (i = 0; i < this.gridWidth; i++) {
    for (j = 0; j < this.gridHeight; j++) {
      var node   = this.grid[i][j];
      node.north = this.grid[i][(j == 0) ? this.gridHeight-1 : j-1];
      node.south = this.grid[i][(j == this.gridHeight-1) ? 0 : j+1];
      node.west  = this.grid[(i == 0) ? this.gridWidth-1 : i-1][j];
      node.east  = this.grid[(i == this.gridWidth-1) ? 0 : i+1][j];
    }
  }

  this.run = function (delta) {
    this.updatePosition(delta);
    this.render(delta);
  };

  this.updatePosition = function (delta) {
    if (KEY_STATUS.left)  this.offsetX -= delta * 5;
    if (KEY_STATUS.right) this.offsetX += delta * 5;
    if (KEY_STATUS.up)    this.offsetY -= delta * 5;
    if (KEY_STATUS.down)  this.offsetY += delta * 5;

    if (this.offsetX < 0) this.offsetX = 0;
    if (this.offsetY < 0) this.offsetY = 0;
    if (this.offsetX > this.width - Game.canvasWidth) this.offsetX = this.width - Game.canvasWidth;
    if (this.offsetY > this.height - Game.canvasHeight) this.offsetY = this.height - Game.canvasHeight;
  };

  this.render = function (delta) {
    // this.renderGrid();
    startx = Math.floor(this.offsetX / GRID_SIZE);
    starty = Math.floor(this.offsetY / GRID_SIZE);
    endx = startx + this.viewportGridWidth + 1;
    endy = starty + this.viewportGridHeight + 1;
    if (endx >= this.gridWidth) endx = this.gridWidth;
    if (endy >= this.gridHeight) endy = this.gridHeight;
    for (i = startx; i < endx; i++) {
      for (j = starty; j < endy; j++) {
        this.grid[i][j].render(delta, i * GRID_SIZE - this.offsetX, j * GRID_SIZE - this.offsetY);
      }
    }
    startx--; endx++;
    for (i = startx; i < endx; i++) {
      this.grid[i][starty-1].reclaim(delta);
      this.grid[i][endy+1].reclaim(delta);
    }
    for (i = starty; i < endy; i++) {
      this.grid[startx][i].reclaim(delta);
      this.grid[endx][i].reclaim(delta);
    }
  };

  this.renderGrid = function () {
    var right = Math.floor(this.offsetX % GRID_SIZE);
    var down = Math.floor(this.offsetY % GRID_SIZE);
    this.context.beginPath();
    for (var i = 0; i < this.gridWidth; i++) {
      this.context.moveTo(i * GRID_SIZE - right, 0);
      this.context.lineTo(i * GRID_SIZE - right, Game.canvasHeight);
    }
    for (var j = 0; j < this.gridHeight; j++) {
      this.context.moveTo(0, j * GRID_SIZE - down);
      this.context.lineTo(Game.canvasWidth, j * GRID_SIZE - down);
    }
    this.context.closePath();
    this.context.stroke();
  };
};

var Game = {
  canvasWidth:  null,
  canvasHeight: null,
  currentLevel: null,
  sprites: [],
  runLevel: function (delta) {
    this.currentLevel.run(delta);
  },
  runSprites: function (delta) {
    for (i = 0; i < this.sprites.length; i++) {

      this.sprites[i].run(delta);

      if (this.sprites[i].reap) {
        this.sprites[i].reap = false;
        this.sprites.splice(i, 1);
        i--;
      }
    }
  }
};

$(function () {
  var canvas = $("#canvas");
  Game.canvasWidth  = canvas.width();
  Game.canvasHeight = canvas.height();

  var context = canvas[0].getContext("2d");

  Level.prototype.context = context;
  GridNode.prototype.context = context;
  GridNode.prototype.background = $('#background');

  // so all the sprites can use it
  Sprite.prototype.context = context;
  Sprite.prototype.matrix  = new Matrix(2, 3);

  var image = new Image();
  image.src = './tiles.png';

  GridNode.prototype.tiles = image;


  Game.currentLevel = new Level(100, 100);

  var i, j = 0;
  var showFramerate = true;
  var avgFramerate = 0;
  var frameCount = 0;
  var elapsedCounter = 0;

  var lastFrame = Date.now();
  var thisFrame;
  var elapsed;
  var delta;

  var mainLoop = function () {
    context.clearRect(0, 0, Game.canvasWidth, Game.canvasHeight);

    thisFrame = Date.now();
    elapsed = thisFrame - lastFrame;
    lastFrame = thisFrame;
    delta = elapsed / 30;

    Game.runLevel(delta);
    Game.runSprites(delta);

    if (showFramerate) {
      context.save();
      context.fillStyle = 'green';
      context.fillText(''+avgFramerate, Game.canvasWidth - 38, Game.canvasHeight - 2);
      context.restore();
    }

    frameCount++;
    elapsedCounter += elapsed;
    if (elapsedCounter > 1000) {
      elapsedCounter -= 1000;
      avgFramerate = frameCount;
      frameCount = 0;
    }
  };

  var mainLoopId = setInterval(mainLoop, 25);

  $(window).keydown(function (e) {
    switch (KEY_CODES[e.keyCode]) {
      case 'f': // show framerate
        showFramerate = !showFramerate;
        break;
      case 'p': // pause
        if (mainLoopId) {
          clearInterval(mainLoopId);
          mainLoopId = null;
          context.save();
          context.fillStyle = 'green';
          context.fillText('PAUSED', 100, 100);
          context.restore();
        } else {
          lastFrame = Date.now();
          mainLoopId = setInterval(mainLoop, 25);
        }
        break;
    }
  });
});

// vim: fdl=0
