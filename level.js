// Level 

define(["game", "gridnode"], function (game, GridNode) {

  var Level = function (gridWidth, gridHeight) {
    var i, j, startX, startY, endX, endY, diffX, diffY;

    var keyStatus = game.controls.keyStatus;

    this.gridWidth  = gridWidth;
    this.gridHeight = gridHeight;
    this.width  = gridWidth * game.gridSize;
    this.height = gridHeight * game.gridSize;
    this.viewportGridWidth  = Math.ceil(game.canvasWidth / game.gridSize);
    this.viewportGridHeight = Math.ceil(game.canvasHeight / game.gridSize);

    // start inside
    this.offsetX = game.gridSize;
    this.offsetY = game.gridSize;

    this.velX = 0;
    this.velY = 0;

    this.grid = new Array(gridWidth);
    this.freeNodes = [];

    this.lastGridX = 1;
    this.lastGridY = 1;

    for (i = 0; i < this.gridWidth; i++) {
      this.grid[i] = new Array(this.gridHeight);
      for (j = 0; j < this.gridHeight; j++) {
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
      if (this.velX || this.velY) this.render(delta);
    };

    this.updatePosition = function (delta) {
      this.velX = 0;
      this.velY = 0;

      // just move by arrow keys for now
      if (keyStatus.left)  this.velX -= delta * 5;
      if (keyStatus.right) this.velX += delta * 5;
      if (keyStatus.up)    this.velY -= delta * 5;
      if (keyStatus.down)  this.velY += delta * 5;

      // hitting the edges
      if ((this.offsetX + this.velX < game.gridSize) ||
          (this.offsetX + this.velX > this.width - game.canvasWidth)) this.velX = 0;
      if ((this.offsetY + this.velY < game.gridSize) ||
          (this.offsetY + this.velY > this.height - game.canvasHeight)) this.velY = 0;

      this.offsetX += this.velX;
      this.offsetY += this.velY;
    };

    this.render = function (delta) {
      // this.renderGrid();
      startX = Math.floor(this.offsetX / game.gridSize);
      startY = Math.floor(this.offsetY / game.gridSize);
      endX = startX + this.viewportGridWidth + 1;
      endY = startY + this.viewportGridHeight + 1;
      if (endX >= this.gridWidth) endX = this.gridWidth;
      if (endY >= this.gridHeight) endY = this.gridHeight;
      for (i = startX; i < endX; i++) {
        for (j = startY; j < endY; j++) {
          this.grid[i][j].render(delta, i * game.gridSize - this.offsetX, j * game.gridSize - this.offsetY);
        }
      }

      // reclaim the edges
      // TODO make this not so yucky

      diffX = startX - this.lastGridX;
      diffY = startY - this.lastGridY;

      if (diffX > 0) {
        for (i = this.lastGridX; i < startX; i++) {
          for (j = startY-1; j < endY+1; j++) {
            this.grid[i][j].reclaim(delta);
          }
        }
      } else if (diffX < 0) {
        for (i = endX; i < endX - diffX; i++) {
          for (j = startY-1; j < endY+1; j++) {
            this.grid[i][j].reclaim(delta);
          }
        }
      }
      if (diffY > 0) {
        for (i = this.lastGridY; i < startY; i++) {
          for (j = startX-1; j < endX+1; j++) {
            this.grid[j][i].reclaim(delta);
          }
        }
      } else if (diffY < 0) {
        for (i = endY; i < endY - diffY; i++) {
          for (j = startX-1; j < endX+1; j++) {
            this.grid[j][i].reclaim(delta);
          }
        }
      }

      this.lastGridX = startX;
      this.lastGridY = startY;
    };

    // run first render
    this.render(0);
  };

  return Level;
});
