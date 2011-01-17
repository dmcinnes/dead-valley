// a Web Worker for filling out the map

onmessage = function (e) {
  var config = e.data.split(',');
  var total = parseInt(config[0]) * parseInt(config[1]);
  var tiles = [];

  for (var i = 0; i < total; i++) {
    var tile = (Math.random() > 0.9) ? Math.floor(Math.random()*2) + 1 : 0;
    tile += '';
    if (Math.random() > 0.5) {
      tile += 'R';
    }
    tiles.push(tile);
  }

  postMessage(tiles);
};
