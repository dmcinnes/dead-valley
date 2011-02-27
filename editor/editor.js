require(['tilemarshal', 'assetmanager'], function (tileMarshal, AssetManager) {

  var Tile = function () {};
  Tile.prototype.tileOffset = 0;
  tileMarshal(Tile);

  var TILE_SIZE = 60;
  var MAP_SIZE  = 64;

  var $tileList = $('#tile-list');

  var $map     = $('#map');
  var $mapMask = $('#map-mask');

  // the current selected tile from the list
  var selectedTile = 0;

  // the current state of the controls
  var flipTiles    = false;
  var rotateTiles  = 0;

  // the current tile targeted by the mouse
  var currentTarget = null;

  var updateTile = function (event) {
    var target = $(event.target);
    if (target.is('.tile')) {
      setTileOffset(target);
      setTileFlip(target);
      setTileRotate(target);
    }
  };

  var setTileOffset = function (tile, offset) {
    offset = offset || selectedTile;
    tile.css({'background-position': -TILE_SIZE * offset + 'px 0px'}).show();
    tile.data('offset', offset);
  };

  var setTileFlip = function (tile, flip) {
    flip = flip || flipTiles;
    if (flip) {
      tile.addClass('flip-horizontal');
    } else {
      tile.removeClass('flip-horizontal');
    }
    tile.data('flip', flip);
  };

  var toggleTileFlip = function (tile) {
    setTileFlip(tile, !tile.is('.flip-horizontal'));
  };

  var setTileRotate = function (tile, rotate) {
    rotate = rotate || rotateTiles;
    tile.removeClass('rotate-90 rotate-180 rotate-270');
    if (rotate) {
      tile.addClass('rotate-'+rotate);
    }
    tile.data('rotate', rotate);
  };

  var cycleTileRotate = function (tile) {
    var rotate = tile.data('rotate') + 90;
    if (rotate > 270) {
      rotate = 0;
    }
    setTileRotate(tile, rotate);
  };

  var selectTileType = function (tile) {
    if (typeof(tile) === 'number') {
      tile = $tileList.children().eq(tile);
    }
    if (tile.is('.list-tile')) {
      tile.siblings().removeClass('selected');
      tile.addClass('selected');
      selectedTile = tile.prevAll().length;
    }
  };

  var loadMap = function (text) {
    $.getScript("../maps/" + text, function () {
      if (map) {
	var tile = new Tile();
	var nodes = $map.children();
	for (var i = 0; i < map.length; i++) {
	  tile.setFromString(map[i]);
	  var node = nodes.eq(i);
	  setTileOffset(node, tile.tileOffset);
	  setTileFlip(node, tile.tileFlip);
	  setTileRotate(node, tile.tileRotate * 90 || 0);
	}
      }
    });
  };

  var saveMap = function () {
  };

  var setupComponentSizes = function () {
    $mapMask.height($tileList.height());
    $mapMask.width(window.innerWidth - $tileList.width() - 60);
  };

  var setupTileList = function () {
    var assetManager = new AssetManager('../assets/');
    var tiles = assetManager.registerImage('tiles.png');

    assetManager.onComplete = function () {
      // set up the tile selection
      var total = tiles.width / TILE_SIZE;
      for (var i = 0; i < total; i++) {
	var tile = $('<div>', {'class':'list-tile'});
	setTileOffset(tile, i);
	$tileList.append(tile);
	if (i == 0) {
	  tile.addClass('selected');
	}
      }

      setupComponentSizes();
    };

    assetManager.loadAssets();
  };

  var setupMapTiles = function () {
    for (var i = 0; i < MAP_SIZE; i++) {
      (function () {
	var top = i;
	window.setTimeout(function () {
	  var tile;
	  for (var left = 0; left < MAP_SIZE; left++) {
	    tile = $('<div>', {'class':'tile'});
	    tile.css({left:left*TILE_SIZE, top:top*TILE_SIZE});
	    $map.append(tile);
	  };
	}, 0);
      })();
    }
  };

  var setupMouseHandling = function () {
    // tile selection
    $tileList.click(function (e) {
      var target = $(e.target);
      selectTileType(target);
    });

    // map clicks/drags
    $map.click(function (e) {
      updateTile(e);
    }).mousemove(function (e) {
      currentTarget = e.target;
      if (e.shiftKey) {
	updateTile(e);
      }
    }).mouseleave(function (e) {
      currentTarget = null;
    });
  };

  var setupControls = function () {
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
      rotateTiles = $(this).val();
    });

    $('#load-button').click(function () {
      $('#load').lightbox_me();
    });

    $('#load-file').change(function (e) {
      loadMap(e.target.files[0].fileName);
      $('.lb_overlay').click(); // cheesy way to close the overlay
    });

    $('#save-button').click(function () {
      $('#save').lightbox_me();
    });
  };

  var setupHotKeys = function () {
    $(window).keydown(function (e) {
      var target = $(currentTarget);
      target = target.is('.tile') && target;

      switch (e.keyCode) {
	case 68: // d is for DROPPER
	  if (target) {
	    selectTileType(target.data('offset') || 0);
	  }
	  break;
	case 70: // f is for FLIP
	  if (e.altKey) {
	    $('#flip-checkbox').click();
	  } else if (target) {
	    toggleTileFlip(target);
	  }
	  break;
	case 82: // r is for ROTATE
	  if (e.altKey) {
	  } else if (target) {
	    cycleTileRotate(target);
	  }
	  break;
	default:
	  // nothing
      }
    });
  };

  require.ready(function () {
    setupTileList();
    setupMapTiles();
    setupMouseHandling();
    setupControls();
    setupHotKeys();
  });

});
