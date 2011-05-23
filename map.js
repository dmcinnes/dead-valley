// Map 

define(["game", "gridnode", "World", "progress", "Building"], function (game, GridNode, World, progress, Building) {

  var Map = function (gridWidth, gridHeight, startX, startY, callback) {
    var i, j,
        imageData,
        startX,     startY,
        gridX,      gridY,
        imageWidth, imageHeight,
        offset,     nodeOffset,
        screenX,    screenY;

    var mapWorker = new Worker("mapworker.js");
    mapWorker.onerror = function (e) {
      console.log('worker error!', e);
    };

    var waitingSectionDownloads = {};

    this.init = function () {
      mapWorker.onmessage = $.proxy(this.mapWorkerCallback, this);

      this.gridWidth  = gridWidth;
      this.gridHeight = gridHeight;
      this.width  = gridWidth * game.gridSize;
      this.height = gridHeight * game.gridSize;
      this.viewportGridWidth  = Math.ceil(game.canvasWidth / game.gridSize);
      this.viewportGridHeight = Math.ceil(game.canvasHeight / game.gridSize);

      // a map consists of 4 sections
      this.sectionWidth  = game.gridSize * gridWidth / 2;
      this.sectionHeight = game.gridSize * gridHeight / 2;

      this.shiftWestBorder = game.canvasWidth;
      this.shiftEastBorder = this.width - (2 * game.canvasWidth);
      this.shiftNorthBorder = game.canvasHeight;
      this.shiftSouthBorder = this.height - (2 * game.canvasHeight);

      // upper left section coordinates
      this.sectionOffsetX = Math.floor(startX / this.sectionWidth);
      this.sectionOffsetY = Math.floor(startY / this.sectionHeight);
      // this is the viewport offset within the current loaded view sections
      this.submapOffsetX = startX - this.sectionOffsetX * this.sectionWidth - game.canvasWidth / 2;
      this.submapOffsetY = startY - this.sectionOffsetY * this.sectionWidth - game.canvasHeight / 2;
      // viewport world coordinates
      this.originOffsetX = startX - game.canvasWidth / 2;
      this.originOffsetY = startY - game.canvasHeight / 2;

      this.velX = 0;
      this.velY = 0;

      this.nodes = new Array(gridWidth * gridHeight);
      this.freeNodes = [];

      this.levelMap = $('<canvas/>').attr({width:gridWidth, height:gridHeight});
      // $('body').append(this.levelMap);

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

      var node;

      // set up the positional references
      for (i = 0; i < this.gridWidth; i++) {
        for (j = 0; j < this.gridHeight; j++) {
          node       = this.getNode(i, j);
          node.north = this.getNode(i, j-1);
          node.south = this.getNode(i, j+1);
          node.west  = this.getNode(i-1, j);
          node.east  = this.getNode(i+1, j);
        }
        node.transformedPoints();
      }
    };

    this.getNodeByWorldCoords = function (x, y) {
      gridX = Math.floor((x - this.originOffsetX + this.submapOffsetX) / game.gridSize);
      gridY = Math.floor((y - this.originOffsetY + this.submapOffsetY) / game.gridSize);
      return this.getNode(gridX, gridY);
    };

    this.getNode = function (x, y) {
      if (x < 0 ||
          y < 0 ||
          x >= this.gridWidth ||
          y >= this.gridHeight) {
        return null;
      }
      return this.getNodeFromSection(x, y, this.levelMapData);
    };

    this.getNodeFromSection = function (x, y, section) {
      offset     = 4 * (y * section.width + x);
      nodeOffset = section.data[offset] +
                   (section.data[offset+1] << 8);
      return this.nodes[nodeOffset];
    };

    this.run = function (delta) {
      this.updatePosition(delta);
      this.shiftLevel();
    };

    this.updatePosition = function (delta) {
      this.submapOffsetX += this.velX;
      this.submapOffsetY += this.velY;
      this.originOffsetX += this.velX;
      this.originOffsetY += this.velY;
    };

    this.shiftLevel = function () {
      var chunks = this.getLevelChunks();

      // TODO figure out a better magic number for this
      var road = Math.random() > 0.5;

      // TODO DRY this up
      if (this.submapOffsetX < this.shiftWestBorder) { // going left
        // east is going away
        this.saveSpritesForChunk(chunks.ne, 'ne');
        this.saveSpritesForChunk(chunks.se, 'se');
        this.sectionOffsetX--;
        // load tiles into east chunks
        this.loadMapTiles(chunks.ne, 'nw', {s:road});
        this.loadMapTiles(chunks.se, 'sw', {n:road});
        // swap east and west
        this.swapVertical(chunks.ne, chunks.nw);
        this.swapVertical(chunks.se, chunks.sw);
        // move the offset for a smooth transition
        this.submapOffsetX = this.submapOffsetX + (this.width / 2);
      } else if (this.submapOffsetX > this.shiftEastBorder) { // going right
        this.saveSpritesForChunk(chunks.nw, 'nw');
        this.saveSpritesForChunk(chunks.sw, 'sw');
        this.sectionOffsetX++;
        this.loadMapTiles(chunks.nw, 'ne', {s:road});
        this.loadMapTiles(chunks.sw, 'se', {n:road});
        this.swapVertical(chunks.ne, chunks.nw);
        this.swapVertical(chunks.se, chunks.sw);
        this.submapOffsetX = this.submapOffsetX - (this.width / 2);
      }
      if (this.submapOffsetY < this.shiftNorthBorder) { // going up
        this.saveSpritesForChunk(chunks.se, 'se');
        this.saveSpritesForChunk(chunks.sw, 'sw');
        this.sectionOffsetY--;
        this.loadMapTiles(chunks.se, 'ne', {w:road});
        this.loadMapTiles(chunks.sw, 'nw', {e:road});
        this.swapHorizontal(chunks.se, chunks.ne);
        this.swapHorizontal(chunks.sw, chunks.nw);
        this.submapOffsetY = this.submapOffsetY + (this.height / 2);
      } else if (this.submapOffsetY > this.shiftSouthBorder) { // going down
        this.saveSpritesForChunk(chunks.ne, 'ne');
        this.saveSpritesForChunk(chunks.nw, 'nw');
        this.sectionOffsetY++;
        this.loadMapTiles(chunks.ne, 'se', {w:road});
        this.loadMapTiles(chunks.nw, 'sw', {e:road});
        this.swapHorizontal(chunks.se, chunks.ne);
        this.swapHorizontal(chunks.sw, chunks.nw);
        this.submapOffsetY = this.submapOffsetY - (this.height / 2);
      }

      // update the current levelData so we can grab the
      // correct tiles with lookups
      this.levelMapData = this.levelMapContext.getImageData(0, 0, gridWidth, gridHeight);
    };

    // save the sprites in a chunk that's getting removed from memory
    this.saveSpritesForChunk = function (chunk, which) {
      var coords = this.getSectionCoords(which);
      var offset = coords.multiply(-this.sectionWidth);
      var nodes = this.convertToNodes(chunk.data);
      var sprites = [];
      var sprite;
      var totalNodes = nodes.length;

      for (var i = 0; i < totalNodes; i++) {
        sprite = nodes[i].nextSprite;
        while (sprite &&
               sprite.name !== 'Dude' &&
               sprite.name !== 'Building') {
          sprite.reap = true;
          // make them relative to the chunk
          sprite.pos.translate(offset);
          sprites.push(sprite.toString());
          sprite = sprite.nextSprite;
        }
      }

      if (sprites.length) {
        World.saveSprites(coords, sprites);
      }
    };

    // swap tile sections around a vertical axis
    this.swapVertical = function (left, right) {
      var leftNode, rightNode, i;
      var leftX = left.width - 1;
      for (i = 0; i < left.height; i++) {
        leftNode  = this.getNodeFromSection(leftX, i, left);
        rightNode = this.getNodeFromSection(0, i, right);
        leftNode.east  = rightNode;
        rightNode.west = leftNode;
      }

      this.levelMapContext.putImageData(left, right.x, right.y);
      this.levelMapContext.putImageData(right, left.x, left.y);
    };

    // swap tile sections around a horizontal axis
    this.swapHorizontal = function (top, bottom) {
      var upperNode, lowerNode, i;
      var bottomY = top.height - 1;
      for (i = 0; i < top.width; i++) {
        upperNode = this.getNodeFromSection(i, bottomY, top);
        lowerNode = this.getNodeFromSection(i, 0, bottom);
        upperNode.south = lowerNode;
        lowerNode.north = upperNode;
      }

      this.levelMapContext.putImageData(top, bottom.x, bottom.y);
      this.levelMapContext.putImageData(bottom, top.x, top.y);
    };

    // return an array of node objects from a part of the map
    this.getMapStrip = function (x, y, w, h) {
      var imageData = this.levelMapContext.getImageData(x, y, w, h);

      return this.convertToNodes(imageData.data);
    };

    // return an array of node objects from imageData
    this.convertToNodes = function (imageData) {
      var i, offset, nodeOffset;

      var nodes = [];

      i = imageData.length / 4;
      while (i) {
        i--;
        offset = i * 4;
        nodeOffset =  imageData[offset] +
                     (imageData[offset+1] << 8);

        nodes[i] = this.nodes[nodeOffset];
      }

      return nodes;
    };

    this.getSectionCoords = function (which) {
      switch(which) {
        case 'nw':
          return new Vector(this.sectionOffsetX,   this.sectionOffsetY);
        case 'ne':
          return new Vector(this.sectionOffsetX+1, this.sectionOffsetY);
        case 'sw':
          return new Vector(this.sectionOffsetX,   this.sectionOffsetY+1);
        case 'se':
          return new Vector(this.sectionOffsetX+1, this.sectionOffsetY+1);
      }
    };

    this.setTilesFromStrings = function (nodes, strings, position) {
      var start  = position.multiply(this.sectionWidth);
      var gridSize = game.gridSize;
      var width  = this.gridWidth / 2;
      var height = this.gridHeight / 2;
      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          var i = y * width + x;
          var node = nodes[i];
          node.setFromString(strings[i]);
          node.setPosition(start.x + x * gridSize, start.y + y * gridSize)
        }
      }
    };

    // map worker has come back with some new section data
    this.mapWorkerCallback = function (e) {
      var data = JSON.parse(e.data);

      switch (data.type) {
        // so we can get output from the worker
        case 'log':
          console.log.apply(console, data.message);
          break;
        case 'newtiles':
          var strings = data.tiles;
          var pos = new Vector(data.position.x, data.position.y);
          var stuff = waitingSectionDownloads[pos];
          if (!stuff) {
            console.warn("nothing in waitingSectionDownloads for '"+pos.toString()+"'");
            return;
          }
          delete waitingSectionDownloads[pos];

          World.setSectionData(pos, data);

          this.setTilesFromStrings(stuff.recipientTiles, strings, pos);

          if (data.sprites) {
            this.addSectionSprites(data.sprites, pos);
          }

          if (data.buildings) {
            this.addSectionBuildings(data.buildings, stuff.recipientTiles, pos);
          }

          if (stuff.callback) {
            stuff.callback(strings);
          }

          break;
        default:
      }
    };

    this.addSectionSprites = function (sprites, pos) {
      game.addSpritesFromStrings(sprites, pos.multiply(this.sectionWidth));
    };

    this.addSectionBuildings = function (buildings, tiles, pos) {
      var offset = pos.multiply(this.sectionWidth);

      // TODO move this into a building marshal thing

      _(buildings).each(function (buildingObj) {
        var i, point, node, building, tile;
        var pointsArr = buildingObj.points;
        var buildingTiles = buildingObj.tiles;

        var points = [];
        for (i = 0; i < pointsArr.length; i += 2) {
          point = offset.add({x:pointsArr[i], y:pointsArr[i+1]});
          points.push(point);
        }
        building = new Building(points);

        for (i = 0; i < buildingTiles.length; i++) {
          tile = tiles[buildingTiles[i]];
          tile.enter(building);
        }
      });
    };

    // TODO make this method signiture less stupid and long
    this.getTilesFromMapWorker = function (recipientTiles, position, width, height, sectionData, callback) {

      // save the data off for use when the worker returns
      waitingSectionDownloads[position] = {
        recipientTiles: recipientTiles,
        callback: callback
      };

      // sectionData can have road data in it
      var roads = $.extend(sectionData, World.getSurroundingRoads(position));
      
      var message = {
        width:       width,
        height:      height,
        position:    position,
        sectionName: sectionData.name,
        roads:       roads
      };

      mapWorker.postMessage(JSON.stringify(message));
    };

    // TODO merge this with mapWorkerCallback
    this.loadMapTiles = function (imageData, positionString, sectionData, callback) {
      var mapWidth  = imageData.width;
      var mapHeight = imageData.height;
      var mapData   = imageData.data;
      var position  = this.getSectionCoords(positionString);

      var newSection = this.convertToNodes(mapData);

      var tiles = World.getTiles(position);

      if (tiles) {
        // we've already created this one, reuse it
        this.setTilesFromStrings(newSection, tiles, position);

        var buildings = World.getBuildings(position);
        if (buildings) {
          this.addSectionBuildings(buildings, newSection, position);
        }

        var sprites = World.getSprites(position);
        if (sprites) {
          this.addSectionSprites(sprites, position);
        }

        if (callback) {
          callback(tiles);
        }
      } else {
        // we need to generate a new section
        this.getTilesFromMapWorker(newSection,
                                   position,
                                   mapWidth,
                                   mapHeight,
                                   sectionData,
                                   callback);
      }
    };

    this.getLevelChunks = function () {
      var halfWidth  = this.gridWidth/2;
      var halfHeight = this.gridHeight/2;
      var chunks = {
        nw: this.levelMapContext.getImageData(0,
                                              0,
                                              halfWidth,
                                              halfHeight),
        sw: this.levelMapContext.getImageData(0,
                                              halfHeight,
                                              halfWidth,
                                              halfHeight),
        ne: this.levelMapContext.getImageData(halfWidth,
                                              0,
                                              halfWidth,
                                              halfHeight),
        se: this.levelMapContext.getImageData(halfWidth,
                                              halfHeight,
                                              halfWidth,
                                              halfHeight)
      };

      chunks.nw.x = 0;
      chunks.nw.y = 0;

      chunks.sw.x = 0;
      chunks.sw.y = halfHeight;

      chunks.ne.x = halfWidth;
      chunks.ne.y = 0;

      chunks.se.x = halfWidth;
      chunks.se.y = halfHeight;

      return chunks;
    };

    this.loadStartMapTiles = function (nw, sw, ne, se) {
      var chunks = this.getLevelChunks();

      progress.setTotal(4);

      var self = this;
      self.loadMapTiles(chunks.nw, 'nw', {name:nw}, function () {
        progress.increment();
        self.loadMapTiles(chunks.sw, 'sw', {name:sw}, function () {
          progress.increment();
          self.loadMapTiles(chunks.ne, 'ne', {name:ne}, function () {
            progress.increment();
            self.loadMapTiles(chunks.se, 'se', {name:se}, function () {
              progress.increment();
              self.loaded();
            });
          });
        });
      });
    };

    this.render = function (delta) {
      if (delta && !this.velX && !this.velY) {
        return;
      }

      startX = Math.floor(this.submapOffsetX / game.gridSize) - 2;
      if (startX < 0) {
        startX = 0;
      }
      startY = Math.floor(this.submapOffsetY / game.gridSize) - 2;
      if (startY < 0) {
        startY = 0;
      }
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
        gridX = Math.floor(((i % imageWidth) + startX) * game.gridSize - this.submapOffsetX);
        gridY = Math.floor((Math.floor(i / imageWidth) + startY) * game.gridSize - this.submapOffsetY);
        this.nodes[nodeOffset].render(delta, gridX, gridY);
      }
    };

    var hBorder = 300.0;
    var vBorder = 180.0;

    this.keepInView = function (sprite) {
      screenX = sprite.pos.x + sprite.vel.x*0.8 - this.originOffsetX;
      screenY = sprite.pos.y + sprite.vel.y*0.8 - this.originOffsetY;

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

    this.save = function () {
      var chunks = this.getLevelChunks();
      this.saveSpritesForChunk(chunks.ne, 'ne');
      this.saveSpritesForChunk(chunks.nw, 'nw');
      this.saveSpritesForChunk(chunks.se, 'se');
      this.saveSpritesForChunk(chunks.sw, 'sw');
    };

    this.loaded = function () {
      console.log('loaded');
      // run first render
      this.render(0);

      // fire the callback
      if (callback) {
        callback();
      }
    };

    this.init();
  };

  return Map;
});
