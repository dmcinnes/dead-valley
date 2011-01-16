// Map 

define(["game", "gridnode"], function (game, GridNode) {

  var Map = function (gridWidth, gridHeight, callback) {
    var i, j,
        imageData,
        startX,     startY,
        gridX,      gridY,
        imageWidth, imageHeight,
        offset,     nodeOffset,
        screenX,    screenY;

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
      this.offsetX = game.gridSize * gridWidth/2  - gridWidth/2;
      this.offsetY = game.gridSize * gridHeight/2 - gridHeight/2;
      // world coordinates
      this.originOffsetX = -game.canvasWidth  / 2.0;
      this.originOffsetY = -game.canvasHeight / 2.0;

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

          // TODO don't do this here, should be in loadMapTiles
          node.setPosition(i * game.gridSize - this.offsetX + this.originOffsetX, j * game.gridSize - this.offsetY + this.originOffsetY);
        }
        node.transformedPoints();
      }

      this.loadStartMapTiles($.proxy(this.loaded, this));

      // test collidable tiles
      // var test = this.getNodeByWorldCoords(0, -140);
      // test.tileOffset = 6;
      // test.collidable = true;
    };

    this.getNodeByWorldCoords = function (x, y) {
      gridX = Math.floor((x - this.originOffsetX + this.offsetX) / game.gridSize);
      gridY = Math.floor((y - this.originOffsetY + this.offsetY) / game.gridSize);
      return this.getNode(gridX, gridY);
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
    };

    this.updatePosition = function (delta) {
      this.offsetX += this.velX;
      this.offsetY += this.velY;
      this.originOffsetX += this.velX;
      this.originOffsetY += this.velY;
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

      // zipper the sections together
      var left, right;
      for (i = 0; i < this.gridHeight; i++) {
        left = this.getNode(chunkWidth-1, i);
        right = this.getNode(chunkWidth, i);
        left.east = right;
        right.west = left;
      }
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

      // zipper the sections together
      var upper, lower;
      for (i = 0; i < this.gridWidth; i++) {
        upper = this.getNode(i, chunkHeight-1);
        lower = this.getNode(i, chunkHeight);
        upper.south = lower;
        lower.north = upper;
      }
    };

    this.loadMapTiles = function (imageData) {
      var imageWidth  = imageData.width;
      var imageHeight = imageData.height;
      var imageData   = imageData.data;
      var nodes       = this.nodes;

      var offset, nodeOffset;
      var i = imageData.length / 4;
      while (i) {
        i--;
        offset = i * 4;
        nodeOffset =  imageData[offset] +
                     (imageData[offset+1] << 8);
        // TODO load new tile data
        // nodes[nodeOffset].tileOffset = parseInt(data[i]);
      }
    };

    this.loadStartMapTiles = function (loadCallback) {
      var imageData =
        this.levelMapContext.getImageData(0,
                                          0,
                                          this.gridWidth,
                                          this.gridHeight);

      var imageWidth  = imageData.width;
      var imageHeight = imageData.height;
      var imageData   = imageData.data;
      var nodes       = this.nodes;

      $.getJSON("maps/start.json", {}, function (data) {
        var offset, nodeOffset;
        var i = imageData.length / 4;
        while (i) {
          i--;
          offset = i * 4;
          nodeOffset =  imageData[offset] +
                       (imageData[offset+1] << 8);
          nodes[nodeOffset].tileOffset = parseInt(data[i]);
          if (data[i].length > 1) {
            switch(data[i][1]) {
              case "R":
                nodes[nodeOffset].tileFlip = true;
                break;
            }
          }
        }

        loadCallback();
      });
    };

    this.render = function (delta) {
      if (delta && !this.velX && !this.velY) return;

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

    var hBorder = 300.0;
    var vBorder = 180.0;

    this.keepInView = function (sprite) {
      screenX = sprite.pos.x - this.originOffsetX;
      screenY = sprite.pos.y - this.originOffsetY;

      this.velX = 0;
      this.velY = 0;

      if (screenX < hBorder) {
        this.velX = screenX - hBorder;
      } else if (screenX > game.canvasWidth - hBorder) {
        this.velX = hBorder + screenX - game.canvasWidth;
      }
      if (screenY < vBorder) {
        this.velY = screenY - vBorder;
      } else if (screenY > game.canvasHeight - vBorder) {
        this.velY = vBorder + screenY - game.canvasHeight;
      }
    };

    this.loaded = function () {
      console.log('loaded');
      // run first render
      this.render(0);

      // fire the callback
      callback && callback();
    };

    this.init();
  };

  return Map;
});
