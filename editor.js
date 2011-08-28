require(['tilemarshal', 'spritemarshal', 'assetmanager', 'progress', 'sprite-info'],
        function (tileMarshal, spriteMarshal, AssetManager, progress, SPRITES) {

  var Tile   = function () {};
  var Sprite = function (spriteInfo) {
    this.spriteInfo = spriteInfo;
  };
  Sprite.prototype.saveMetadata = function () {
    var pos = this.spriteTile.position();
    return {
      clazz: this.name.replace(/\d+$/, ''), // numbers at the end denote types
      type:  this.name,
      pos:   this.pos
    };
  };

  var TILE_SIZE = 60;
  var MAP_SIZE  = 64;
  var TILE_SHEET_WIDTH;

  var $tileList   = $('#tile-list');

  var $spriteList = $('#sprite-list');

  var $coordDisplay = $('#coord-display');
  var $xCoord = $('#x-coord');
  var $yCoord = $('#y-coord');

  var $map       = $('#map');
  var $mapMask   = $('#map-mask');
  var $mapCanvas = $('#map-canvas');

  // stop dragging causing safari to lock up
  $mapMask[0].onselectstart = function () { return false };

  var mapCanvasContext = $mapCanvas[0].getContext('2d');
  var mapCanvasSize    = {
    height: $mapCanvas.height(),
    width:  $mapCanvas.width()
  };

  // set this one after the tile list is loaded
  // just use 0,0 for now
  var mapMaskPos  = {
    left: 0,
    top:  0
  };

  // where the mouse is currently pointing on the map
  var currentMapOffset = {
    x: 0,
    y: 0
  };

  // the last mouse move event
  var lastMouseMoveEvent = null;

  // array holding the current buildings
  var buildings = [];

  // the total number of tiles in the tile list
  var totalTileCount;

  // the current selected tile from the list
  var selectedTile = 0;

  // the current selected sprite from the list
  var selectedSprite = -1;

  // the current state of the controls
  var flipTiles    = false;
  var rotateTiles  = 0;

  // the current selected sprite
  var currentSprite = null;

  // the current building we're constructing
  var newBuilding = null;
  var newBuildingAddPoints = false;

  var TileDisplay = {
    findTile: function (event) {
      var target = $(event.target);
      if (target.is('.tile')) {
        return target;
      } else if (target.is(':not(.sprite)')) { // ignore sprites
        var x = Math.floor(event.offsetX / TILE_SIZE);
        var y = Math.floor(event.offsetY / TILE_SIZE);
        var offset = y * MAP_SIZE + x;
        return $map.children('.tile:eq('+offset+')');
       }
    },

    getTileObject: function (tile) {
      if (tile.target) { // 'tile' is an event object
        tile = TileDisplay.findTile(tile);
      }
      return tile.data('tile');
    },

    update: function (tile, attr, value) {
      TileDisplay[attr](tile, value);
    },

    tileOffset: function (tile, offset) {
      var left = (offset % TILE_SHEET_WIDTH) * TILE_SIZE;
      var top  = Math.floor(offset / TILE_SHEET_WIDTH) * TILE_SIZE;
      tile.css({'background-position': -left + 'px ' + -top + 'px'}).show();
    },

    tileFlip: function (tile, flip) {
      if (flip) {
        tile.addClass('flip-horizontal');
      } else {
        tile.removeClass('flip-horizontal');
      }
    },

    tileRotate: function (tile, rotate) {
      rotate = rotate * 90; // values are 0-3
      tile.removeClass('rotate-90 rotate-180 rotate-270');
      if (rotate) {
        tile.addClass('rotate-'+rotate);
      }
    },
  };

  var BuildingDisplay = {
    render: function () {
      mapCanvasContext.clearRect(0, 0, mapCanvasSize.width, mapCanvasSize.height);
      mapCanvasContext.save();
      mapCanvasContext.font = '10pt sans-serif';

      $map.children('.building').remove();

      var self = this;

      _.each(buildings, function (building) {

        var upperLeftCorner = self.renderBuildingPoints(building, true);

        // render the building's name
        var label = $('<span/>').addClass('building').text(building.name);
        label.data('building', building);
        label.css({
          left: upperLeftCorner.x,
          top: upperLeftCorner.y
        });
        $map.append(label);

        // render any entrances
        _.each(building.entrances, function (entrance) {
          $map.children('.tile:eq('+entrance+')').addClass('entrance');
        });
      });
      mapCanvasContext.restore();
    },

    renderPointsInProgress: function (e) {
      if (newBuilding.points.length) {
        mapCanvasContext.save();

        mapCanvasContext.clearRect(0, 0, mapCanvasSize.width, mapCanvasSize.height);

        this.renderBuildingPoints(newBuilding, false);

        // render the 'ghost' line to the mouse
        var points = newBuilding.points;
        var last   = points.length-1;
        var point  = convertEventToCoords(e);
        mapCanvasContext.strokeStyle = "rgba(0,0,255,0.2)";
        mapCanvasContext.moveTo(points[length-1], points[length]);
        mapCanvasContext.lineTo(point.x, point.y);
        mapCanvasContext.stroke();
        
        mapCanvasContext.restore();
      }
    },

    renderBuildingPoints: function (building, closePath) {
      var points = building.points;

      mapCanvasContext.fillStyle = 'blue';
      mapCanvasContext.strokeStyle = 'blue';
      mapCanvasContext.lineWidth = 3;

      mapCanvasContext.beginPath();
      mapCanvasContext.moveTo(points[0], points[1]);
      var smallestX = points[0];
      var smallestY = points[1];
      for (var i = 2; i < points.length; i += 2) {
        var x = points[i];
        var y = points[i+1];
        mapCanvasContext.lineTo(x, y);
        smallestX = Math.min(smallestX, x);
        smallestY = Math.min(smallestY, y);
      }
      if (closePath) {
        mapCanvasContext.closePath();
      }
      mapCanvasContext.stroke();

      return {
        x: smallestX,
        y: smallestY
      };
    }
  };

  var selectTileType = function (tile) {
    if (typeof(tile) === 'number') {
      tile = $tileList.children().eq(tile);
    }
    if (tile && tile.is('.list-tile')) {
      tile.siblings().removeClass('selected');
      tile.addClass('selected');
      selectedTile = tile.prevAll().length;
      selectSpriteType(); // clear selected sprite
    } else {
      $tileList.children().removeClass('selected');
      selectedTile = -1;
    }
  };
  
  var selectSpriteType = function (sprite) {
    if (typeof(sprite) === 'number') {
      sprite = $spriteList.children().eq(sprite);
    }
    if (sprite) {
      sprite.siblings().removeClass('selected');
      sprite.addClass('selected');
      selectedSprite = sprite.prevAll().length;
      selectTileType(); // clear selected tile
    } else {
      $spriteList.children().removeClass('selected');
      selectedSprite = -1;
    }
  };

  var loadMap = function (text) {
    $.getScript("maps/" + text, function () {

      // clear the sprites
      $map.children('.sprite').remove();

      if (window.map) {
        progress.setTotal(window.map.length);

        var line = 0;
        var nodes = $map.children('.tile');
        for (var i = 0; i < MAP_SIZE; i++) {
          (function (line) {
            var index, node, tileObject, j;
            window.setTimeout(function () {
              for (j = 0; j < MAP_SIZE; j++) {
                index = line * MAP_SIZE + j;
                node = nodes.eq(index);
                tileObject = TileDisplay.getTileObject(node);
                tileObject.setFromString(window.map[index]);
              }
              progress.increment(MAP_SIZE);
            }, 0);
          })(i);
        }
      }

      if (window.sprites) {
        _(window.sprites).each(function (spriteString) {
          var spriteData = JSON.parse(spriteString);
          var x          = parseInt(spriteData.pos.x);
          var y          = parseInt(spriteData.pos.y);
          var rot        = parseInt(spriteData.pos.rot);
          var type       = spriteData.type || spriteData.clazz;
          var info       = SPRITES[type];
          var sprite     = generateSpriteTile('div', type).css({
            left: x - info.center.x,
            top: y - info.center.y
          });
          setSpriteRotation(sprite, rot);
          $map.append(sprite);
        });
      }

      // load buildings when done
      if (window.buildings) {
        buildings = window.buildings;
        delete window.buildings;
        BuildingDisplay.render();
      }
    });
  };

  var saveMapText = function () {
    var tiles = [];
    var nodes = $map.children('.tile');
    for (var i = 0; i < nodes.length; i++) {
      var tileObject = TileDisplay.getTileObject(nodes.eq(i));
      tiles.push(tileObject.toString());
    }
    // TODO do something with these magic numbers
    var roads = {
      n: TileDisplay.getTileObject(nodes.eq(32)).tileOffset === 5,
      s: TileDisplay.getTileObject(nodes.eq(4064)).tileOffset === 5,
      e: TileDisplay.getTileObject(nodes.eq(2111)).tileOffset === 5,
      w: TileDisplay.getTileObject(nodes.eq(2048)).tileOffset === 5
    };
    var sprites = _.map($map.children('.sprite'), function (sprite) {
                    return spriteMarshal.unmarshal($(sprite).data('sprite'));
                  });

    return [
      "map=\"" + tiles.join('') + "\"",
      "roads=" + JSON.stringify(roads),
      "sprites=" + JSON.stringify(sprites),
      "buildings=" + JSON.stringify(buildings)
    ].join(';') + ';';
  };

  var generateSpriteTile = function (type, name) {
    var val = SPRITES[name];
    var spriteTile = $('<'+type+'/>').css({
      'background-image': 'url(assets/' + val.img + '.png)',
      'background-position': -val.imageOffset.x + ' ' + -val.imageOffset.y,
      width: val.width,
      height: val.height
    }).addClass('sprite');

    var spriteObj = new Sprite(val);
    spriteObj.name = name;
    spriteObj.spriteTile = spriteTile;
    spriteTile.data('sprite', spriteObj);

    return spriteTile;
  };

  var updateTile = function (event) {
    var tileObject = TileDisplay.getTileObject(event);
    tileObject.tileOffset = selectedTile;
    tileObject.tileFlip   = flipTiles;
    tileObject.tileRotate = rotateTiles;
  };

  var selectSprite = function (event) {
    var target = $(event.target);
    if (target.is('.sprite')) {
      target.siblings('.sprite').removeClass('selected');
      target.addClass('selected');
    }
    return target;
  };

  var addSprite = function (event) {
    $map.children('.sprite').removeClass('selected');
    var node = $spriteList.children().eq(selectedSprite);
    var spriteTile = node.clone();

    var oldSpriteObj = node.data('sprite');

    // create a new sprite object
    var spriteObj = new Sprite(oldSpriteObj.spriteInfo);
    spriteObj.name = oldSpriteObj.name;
    spriteObj.spriteTile = spriteTile;
    spriteTile.data('sprite', spriteObj);

    setSpritePosition(spriteTile, event.pageX, event.pageY);

    $map.append(spriteTile);
  };

  var moveSelectedSprite = function (x, y) {
    var sprite = $map.children('.sprite.selected');
    if (sprite.length) {
      var pos = sprite.position();
      sprite.css({
        left: pos.left + x,
        top: pos.top + y
      });
    }
  };

  var rotateSelectedSprite = function (e) {
    var sprite = $map.children('.sprite.selected');
    if (sprite.length) {
      var rot = sprite.data('rotate') || 0;
      rot += e.shiftKey ? 30 : 1;
      setSpriteRotation(sprite, rot);
    }
  };

  var setSpriteRotation = function (sprite, rot) {
    sprite.css('-webkit-transform', "rotate("+rot+"deg)");
    sprite.data('rotate', rot);
  };

  var setSpritePosition = function (sprite, x, y) {
    sprite.css({
      left: x + $mapMask[0].scrollLeft - mapMaskPos.left - sprite.width()/2,
      top: y + $mapMask[0].scrollTop - mapMaskPos.top - sprite.height()/2
    });
  };

  var toggleTileFlip = function (tile) {
    var tileObject = TileDisplay.getTileObject(tile);
    tileObject.tileFlip = !tileObject.tileFlip;
  };

  var cycleTileRotate = function (tile) {
    var tileObject = TileDisplay.getTileObject(tile);
    tileObject.tileRotate = (tileObject.tileRotate + 1) % 4;
  };

  var convertEventToCoords = function (event) {
    return {
      x: event.pageX + $mapMask[0].scrollLeft - mapMaskPos.left,
      y: event.pageY + $mapMask[0].scrollTop - mapMaskPos.top
    }
  };

  var updateCurrentMapOffset = function (event) {
    currentMapOffset = convertEventToCoords(event);
    updateMousePositionDisplay();
  };

  var clearCurrentMapOffset = function () {
    currentMapOffset.x = 0;
    currentMapOffset.y = 0;
    clearMousePosition();
  };

  var updateMousePositionDisplay = function () {
    $coordDisplay.show();
    $xCoord.text(currentMapOffset.x);
    $yCoord.text(currentMapOffset.y);
  };

  var clearMousePosition = function () {
    $coordDisplay.hide();
  };

  var outlineBuildingStart = function (buildingName) {
    newBuilding = {
      name:      buildingName,
      points:    [],
      tiles:     [],
      entrances: [],
      inventory: []
    };
    newBuildingAddPoints = true;
    buildings.push(newBuilding);
  };

  var addBuildingPoint = function (event) {
    var coords = convertEventToCoords(event);
    var diffx = Math.abs(coords.x - newBuilding.points[0]);
    var diffy = Math.abs(coords.y - newBuilding.points[1]);
    if (diffx < 3 && diffy < 3) {
      // close it off
      newBuildingAddPoints = false;
      BuildingDisplay.render();
    } else {
      newBuilding.points.push(coords.x, coords.y);
      BuildingDisplay.renderPointsInProgress(event);
    }
  };

  var setup = {

    tileObject: function () {
      Tile.prototype.tileOffset = 0;
      _(['tileOffset', 'tileFlip', 'tileRotate']).each(function (attr) {
        Tile.prototype.__defineSetter__(attr, function (val) {
          if (!this.values) {
            this.values = {};
          }
          this.values[attr] = val;
          if (this.callback) {
            this.callback(this.tileDisplay, attr, val);
          }
        });
        Tile.prototype.__defineGetter__(attr, function () {
          return (this.values && this.values[attr]) || 0;
        });
      });
      // so the view can get the data updates
      Tile.prototype.callback = TileDisplay.update;
      tileMarshal(Tile);
    },

    spriteObject: function () {
      Sprite.prototype.__defineGetter__('pos', function () {
        var rot = this.spriteTile.data('rotate');
        setSpriteRotation(this.spriteTile, 0); // unrotate so we get the correct position
        var pos = this.spriteTile.position();
        setSpriteRotation(this.spriteTile, rot);
        var center = this.spriteInfo.center;
        return {
          x: pos.left + center.x,
          y: pos.top + center.y,
          rot: rot
        };
      });
    },

    mouseHandling: function () {
      // tile selection
      $tileList.click(function (e) {
        var target = $(e.target);
        selectTileType(target);
      });

      $spriteList.click(function (e) {
        var target = $(e.target);
        selectSpriteType(target);
      });

      // map clicks/drags
      $mapMask.click(function (e) {
        if (newBuilding && newBuildingAddPoints) {
          addBuildingPoint(e);
        } else if ($(e.target).is('.sprite')) {
          selectSprite(e);
        } else if (selectedTile > -1) {
          updateTile(e);
        } else {
          addSprite(e);
        }
      }).mousedown(function (e) {
        var spr = selectSprite(e);
        if (spr && spr.is('.sprite')) {
          currentSprite = spr;
        }
      }).mousemove(function (e) {
        lastMouseMoveEvent = e;
        if (newBuilding && newBuildingAddPoints) {
          BuildingDisplay.renderPointsInProgress(e);
        } else if (currentSprite) {
          setSpritePosition(currentSprite, e.pageX, e.pageY);
        } else if (e.shiftKey) {
          updateTile(e);
        }
        updateCurrentMapOffset(e);
      }).mouseup(function (e) {
        currentSprite = null;
      }).mouseleave(function (e) {
        lastMouseMoveEvent = null;
        clearCurrentMapOffset();
      });
    },

    controls: function () {
      // show grid checkbox
      $('#show-grid-checkbox').change(function (e) {
        if ($(this).is(':checked')) {
          $map.addClass('show-grid');
        } else {
          $map.removeClass('show-grid');
        }
      });

      // flip checkbox
      $('#flip-checkbox').change(function (e) {
        flipTiles = $(this).is(':checked');
      });

      // rotate select box
      $('#rotate-control').change(function (e) {
        rotateTiles = parseInt($(this).val());
      });

      // open the new building dialog
      $('#new-building-button').click(function () {
        $('#new-building').lightbox_me();
        $('#new-building-name').focus();
      });

      // start creating a new building
      $('#new-building-ok').click(function () {
        $('.lb_overlay').click(); // cheesy way to close the overlay
        outlineBuildingStart($('#new-building-name').val());
      });

      $('#load-button').click(function () {
        $('#load').lightbox_me();
      });

      $('#load-file').change(function (e) {
        $('.lb_overlay').click(); // cheesy way to close the overlay
        loadMap(e.target.files[0].fileName);
      });

      $('#save-button').click(function () {
        var saveText = $('#save-text');
        saveText.val(saveMapText());

        $('#save').lightbox_me({
          onLoad: function () {
            saveText.focus().select();
          }
        });
      });
    },

    hotKeys: function () {
      $(window).keydown(function (e) {
        var target = null;
        if (lastMouseMoveEvent) {
          target = TileDisplay.findTile(lastMouseMoveEvent);
        }

        switch (e.keyCode) {
          case 70: // f is for FLIP
            if (e.altKey) {
              $('#flip-checkbox').click();
            } else if (target) {
              toggleTileFlip(target);
            }
            break;
          case 73: // i is for I-DROPPER
            if (target) {
              var tileObject = TileDisplay.getTileObject(target);
              if (tileObject) {
                selectTileType((tileObject.values && tileObject.values.tileOffset) || 0);
              }
            }
            break;
          case 81: // q is for up tile
            var tileNumber = selectedTile - 1;
            if (tileNumber < 0) {
              tileNumber = totalTileCount - 1;
            }
            selectTileType(tileNumber);
            break;
          case 65: // a is for down tile
            var tileNumber = selectedTile + 1;
            if (tileNumber >= totalTileCount) {
              tileNumber = 0;
            }
            selectTileType(tileNumber);
            break;
          case 82: // r is for ROTATE
            if (e.altKey) {
            } else if (target) {
              cycleTileRotate(target);
            } else {
              rotateSelectedSprite(e);
            }
            break;
          case 8: // delete is for DELETE
            $map.children('.sprite.selected').remove();
            break;
          case 37: // left is for LEFT
            moveSelectedSprite(-1, 0);
            e.preventDefault();
            break;
          case 38: // up is for UP
            moveSelectedSprite(0, -1);
            e.preventDefault();
            break;
          case 39: // right is for RIGHT
            moveSelectedSprite(1, 0);
            e.preventDefault();
            break;
          case 40: // down is for DOWN
            moveSelectedSprite(0, 1);
            e.preventDefault();
            break;
          case 27: // ESC is for escape
            newBuilding = null;
            newBuildingAddPoints = false;
            break;

          default:
            // nothing
        }
      });
    },

    componentSizes: function () {
      var height = window.innerHeight - 60;
      var width = window.innerWidth - $tileList.width() - 60;
      $tileList.height(height);
      $mapMask.height(height);
      $mapMask.width(width);
      // update the mask position
      mapMaskPos = $mapMask.position();
    },

    tileList: function () {
      var assetManager = new AssetManager('./assets/');

      assetManager.loadImage('tiles', function (tiles) {
        // set up the tile selection
        TILE_SHEET_WIDTH = tiles.width / TILE_SIZE;
        totalTileCount = TILE_SHEET_WIDTH * (tiles.height / TILE_SIZE);
        for (var i = 0; i < totalTileCount; i++) {
          var tile = $('<div>', {'class':'list-tile'});
          TileDisplay.tileOffset(tile, i);
          $tileList.append(tile);
          if (i == 0) {
            tile.addClass('selected');
          }
        }

        setup.componentSizes();
      });
    },

    spriteList: function () {
      _(SPRITES).each(function (val, name) {
        var sprite = generateSpriteTile('li', name).attr('id', name+'-sprite');
        $spriteList.append(sprite);
      });
    },

    mapTiles: function () {
      for (var top = 0; top < MAP_SIZE; top++) {
        var tile, tileObj;
        for (var left = 0; left < MAP_SIZE; left++) {
          tile = $('<div>', {'class':'tile'});
          tile.css({left:left*TILE_SIZE, top:top*TILE_SIZE});
          tileObj = new Tile();
          tileObj.tileDisplay = tile;
          tile.data('tile', tileObj);
          $map.append(tile);
        };
      }

      var tiles = $map.children('.tile');

      // mark which tiles are the road matchers
      _([  31,   32,   33,
         1984, 2048, 2112,
         2047, 2111, 2175,
         4063, 4064, 4065]).each(function (offset) {
        tiles.eq(offset).addClass('road-matcher');
      });
    }

  };

  require.ready(function () {
    setup.tileObject();
    setup.spriteObject();
    setup.tileList();
    setup.spriteList();
    setup.mapTiles();
    setup.mouseHandling();
    setup.controls();
    setup.hotKeys();
  });

});
