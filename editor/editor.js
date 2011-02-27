require(['tilemarshal', 'assetmanager'], function (tileMarshal, AssetManager) {

  var TILE_SIZE = 60;
  var MAP_SIZE  = 64;

  var tileList = $('#tile-list');

  var map     = $('#map');
  var mapMask = $('#map-mask');

  var selectedTile = 0;

  var setTileOffset = function (tile, offset) {
    offset = offset || selectedTile;
    tile.css({'background-position': -TILE_SIZE * offset + 'px 0px'}).show();
    tile.data('offset', offset);
  };

  var setTileFlip = function (tile, flip) {
    if (flip) {
      tile.addClass('flip-horizontal');
    } else {
      tile.removeClass('flip-horizontal');
    }
    tile.data('flip', flip);
  };

  var setupComponentSizes = function () {
    mapMask.height(tileList.height());
    mapMask.width(window.innerWidth - tileList.width() - 60);
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
	tileList.append(tile);
	if (i == 0) {
	  tile.addClass('selected');
	}
      }

      setupComponentSizes();
    };

    assetManager.loadAssets();
  };

  var setupMapTiles = function () {
    for (var x = 0; x < MAP_SIZE; x++) {
      (function () {
	var left = x;
	window.setTimeout(function () {
	  var tile;
	  for (var y = 0; y < MAP_SIZE; y++) {
	    tile = $('<div>', {'class':'tile'});
	    tile.css({left:left*TILE_SIZE, top:y*TILE_SIZE});
	    map.append(tile);
	  };
	}, 0);
      })();
    }
  };

  var setupEventHandling = function () {
    // tile selection
    tileList.click(function (e) {
      var target = $(e.target);
      if (target.is('.list-tile')) {
	target.siblings().removeClass('selected');
	target.addClass('selected');
	selectedTile = target.prevAll().length;
      }
    });

    // show grid checkbox
    $('#show-grid-checkbox').change(function (e) {
      if ($(this).is(':checked')) {
	map.addClass('show-grid');
      } else {
	map.removeClass('show-grid');
      }
    });

    var updateTile = function (e) {
      var target = $(e.target);
      if (target.is('.tile')) {
	setTileOffset(target);
      }
    };

    var down = false;

    // map clicks/drags
    map.click(function (e) {
      updateTile(e);
    }).mousemove(function (e) {
      if (e.shiftKey) {
	updateTile(e);
      }
    });
  };

  require.ready(function () {
    setupTileList();
    setupMapTiles();
    setupEventHandling();
  });

});
