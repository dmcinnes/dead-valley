// Level 

define(["game", "gridnode"], function (game, GridNode) {

  var Level = function (gridWidth, gridHeight) {
    var i, j, startX, startY, endX, endY, diffX, diffY, offset, nodeOffset;

    var keyStatus = game.controls.keyStatus;

    this.init = function () {
      this.gridWidth  = gridWidth;
      this.gridHeight = gridHeight;
      this.width  = gridWidth * game.gridSize;
      this.height = gridHeight * game.gridSize;
      this.viewportGridWidth  = Math.ceil(game.canvasWidth / game.gridSize);
      this.viewportGridHeight = Math.ceil(game.canvasHeight / game.gridSize);

      // start in the center
      this.offsetX = game.gridSize * gridWidth/2 - gridWidth/2;
      this.offsetY = game.gridSize * gridHeight/2 - gridHeight/2;

      this.velX = 0;
      this.velY = 0;

      this.nodes = new Array(gridWidth * gridHeight);
      this.freeNodes = [];

      this.lastGridX = 1;
      this.lastGridY = 1;

      this.levelMap = $('<canvas/>').attr({width:gridWidth, height:gridHeight});
      $('body').append(this.levelMap);

      this.levelMapContext = this.levelMap[0].getContext("2d");
      this.levelMapData = this.levelMapContext.createImageData(gridWidth, gridHeight);

      var mapData = this.levelMapData.data;
      for (i = 0; i < this.nodes.length; i++) {
        this.nodes[i] = new GridNode(this);
        j = i * 4;
        mapData[j]     = i & 255;
        mapData[j + 1] = (i >> 8) & 255;
        mapData[j + 2] = (i >> 16) & 255;
        mapData[j + 3] = 255; // has to be set
      }
      this.levelMapContext.putImageData(this.levelMapData, 0, 0);

      // set up the positional references
      for (i = 0; i < this.gridWidth; i++) {
        for (j = 0; j < this.gridHeight; j++) {
          var node   = this.getNode(i, j);
          node.north = this.getNode(i, j-1);
          node.south = this.getNode(i, j+1);
          node.west  = this.getNode(i-1, j);
          node.east  = this.getNode(i+1, j);
        }
      }
    };

    this.getNode = function (x, y) {
      if (x < 0 ||
          y < 0 ||
          x >= this.gridWidth ||
          y >= this.gridHeight) return null;
      offset     = 4 * (y * this.gridWidth + x);
      nodeOffset = this.levelMapData.data[offset] +
                   (this.levelMapData.data[offset+1] << 8) +
                   (this.levelMapData.data[offset+2] << 16);
      // console.log('x:', x, 'y:', y);
      // console.log('offset:', offset);
      // console.log(this.levelMapData.data[offset],
      //              this.levelMapData.data[offset+1],
      //              this.levelMapData.data[offset+2]);
      // console.log('nodeOffset:', nodeOffset);
      // console.log('---');
      return this.nodes[nodeOffset];
    };

    this.run = function (delta) {
      this.updatePosition(delta);
      if (this.velX || this.velY) this.render(delta);
    };

    this.updatePosition = function (delta) {
      this.velX = 0;
      this.velY = 0;

      // just move by arrow keys for now
      if (keyStatus.left)  this.velX -= delta * 120;
      if (keyStatus.right) this.velX += delta * 120;
      if (keyStatus.up)    this.velY -= delta * 120;
      if (keyStatus.down)  this.velY += delta * 120;

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
          this.getNode(i, j).render(delta, i * game.gridSize - this.offsetX, j * game.gridSize - this.offsetY);
        }
      }

      // reclaim the edges
      // TODO make this not so yucky

      diffX = startX - this.lastGridX;
      diffY = startY - this.lastGridY;

      if (diffX > 0) {
        for (i = this.lastGridX; i < startX; i++) {
          for (j = startY-1; j < endY+1; j++) {
            this.getNode(i, j).reclaim(delta);
          }
        }
      } else if (diffX < 0) {
        for (i = endX; i < endX - diffX; i++) {
          for (j = startY-1; j < endY+1; j++) {
            this.getNode(i, j).reclaim(delta);
          }
        }
      }
      if (diffY > 0) {
        for (i = this.lastGridY; i < startY; i++) {
          for (j = startX-1; j < endX+1; j++) {
            this.getNode(i, j).reclaim(delta);
          }
        }
      } else if (diffY < 0) {
        for (i = endY; i < endY - diffY; i++) {
          for (j = startX-1; j < endX+1; j++) {
            this.getNode(i, j).reclaim(delta);
          }
        }
      }

      this.lastGridX = startX;
      this.lastGridY = startY;
    };

    this.init();

    // run first render
    this.render(0);
  };

  return Level;
});
