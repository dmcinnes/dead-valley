// Map 

define(["game", "gridnode"], function (game, GridNode) {

  var Map = function (gridWidth, gridHeight) {
    var i, j,
        imageData,
        startX,     startY,
        gridX,      gridY,
        imageWidth, imageHeight,
        offset,     nodeOffset;

    var keyStatus = game.controls.keyStatus;

    this.init = function () {
      this.gridWidth  = gridWidth;
      this.gridHeight = gridHeight;
      this.width  = gridWidth * game.gridSize;
      this.height = gridHeight * game.gridSize;
      this.viewportGridWidth  = Math.ceil(game.canvasWidth / game.gridSize);
      this.viewportGridHeight = Math.ceil(game.canvasHeight / game.gridSize);

      this.shiftWestBorder = game.canvasWidth;
      this.shiftEastBorder = this.width - (2 * game.canvasWidth);
      this.shiftNorthBorder = game.canvasHeight;
      this.shiftSouthBorder = this.height - (2 * game.canvasHeight);

      // start in the center
      // this.offsetX = game.gridSize * gridWidth/2 - gridWidth/2;
      // this.offsetY = game.gridSize * gridHeight/2 - gridHeight/2;
      this.offsetX = 120;
      this.offsetY = 200;

      this.velX = 0;
      this.velY = 0;

      this.nodes = new Array(gridWidth * gridHeight);
      this.freeNodes = [];

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
                   (this.levelMapData.data[offset+1] << 8);
      return this.nodes[nodeOffset];
    };

    this.run = function (delta) {
      this.updatePosition(delta);
      this.shiftLevel();
      if (this.velX || this.velY) this.render(delta);
    };

    this.updatePosition = function (delta) {
      this.velX = 0;
      this.velY = 0;

      // just move by arrow keys for now
      // if (keyStatus.left)  this.velX -= delta * 120;
      // if (keyStatus.right) this.velX += delta * 120;
      // if (keyStatus.up)    this.velY -= delta * 120;
      // if (keyStatus.down)  this.velY += delta * 120;

      // hitting the edges
      if ((this.offsetX + this.velX < game.gridSize) ||
          (this.offsetX + this.velX > this.width - game.canvasWidth)) this.velX = 0;
      if ((this.offsetY + this.velY < game.gridSize) ||
          (this.offsetY + this.velY > this.height - game.canvasHeight)) this.velY = 0;

      this.offsetX += this.velX;
      this.offsetY += this.velY;
    };

    this.shiftLevel = function () {
      if (this.offsetX < this.shiftWestBorder) {
        this.shiftHorizontal('west');
        this.offsetX = this.offsetX + (this.width / 2);
      } else if (this.offsetX > this.shiftEastBorder) {
        this.shiftHorizontal('east');
        this.offsetX = this.offsetX - (this.width / 2);
      }
      if (this.offsetY < this.shiftNorthBorder) {
        this.shiftVertical('north');
        this.offsetY = this.offsetY + (this.height / 2);
      } else if (this.offsetY > this.shiftSouthBorder) {
        this.shiftVertical('south');
        this.offsetY = this.offsetY - (this.height / 2);
      }
    };

    this.shiftHorizontal = function (direction) {
      var chunkWidth = this.gridWidth / 2;
      var left =
        this.levelMapContext.getImageData(0,
                                          0,
                                          chunkWidth,
                                          this.gridHeight);
      var right =
        this.levelMapContext.getImageData(chunkWidth,
                                          0,
                                          chunkWidth,
                                          this.gridHeight);

      this.levelMapContext.putImageData(right, 0, 0);
      this.levelMapContext.putImageData(left, chunkWidth, 0);

      // which chunk to load the new part of the map into
      var chunk = (direction == 'east') ? left : right;
      this.loadMapTiles(chunk);
    };

    this.shiftVertical = function (direction) {
      var chunkHeight = this.gridHeight / 2;
      var top =
        this.levelMapContext.getImageData(0,
                                          0,
                                          this.gridWidth,
                                          chunkHeight);
      var bottom =
        this.levelMapContext.getImageData(0,
                                          chunkHeight,
                                          this.gridWidth,
                                          chunkHeight);

      this.levelMapContext.putImageData(bottom, 0, 0);
      this.levelMapContext.putImageData(top, 0, chunkHeight);

      // which chunk to load the new part of the map into
      var chunk = (direction == 'south') ? top : bottom;
      this.loadMapTiles(chunk);
    };

    this.loadMapTiles = function (imageData) {
      imageWidth  = imageData.width;
      imageHeight = imageData.height;
      imageData   = imageData.data;

      i = imageData.length / 4;
      while (i) {
        i--;
        offset = i * 4;
        nodeOffset =  imageData[offset] +
                     (imageData[offset+1] << 8);
        // TODO load map data
        // this.nodes[nodeOffset].tileOffset = 0;
      }
    };

    this.render = function (delta) {
      startX = Math.floor(this.offsetX / game.gridSize) - 2;
      if (startX < 0) startX = 0;
      startY = Math.floor(this.offsetY / game.gridSize) - 2;
      if (startY < 0) startY = 0;
      imageWidth  = this.viewportGridWidth  + 4;
      imageHeight = this.viewportGridHeight + 4;

      imageData =
        this.levelMapContext.getImageData(startX,
                                          startY,
                                          imageWidth,
                                          imageHeight);
      imageWidth  = imageData.width;
      imageHeight = imageData.height;
      imageData   = imageData.data;

      i = imageData.length / 4;
      while (i) {
        i--;
        offset = i * 4;
        nodeOffset =  imageData[offset] +
                     (imageData[offset+1] << 8);
        gridX = ((i % imageWidth) + startX) * game.gridSize - this.offsetX;
        gridY = (Math.floor(i / imageWidth) + startY) * game.gridSize - this.offsetY;
        this.nodes[nodeOffset].render(delta, gridX, gridY);
      }
    };

    this.init();

    // run first render
    this.render(0);
  };

  return Map;
});
