define(['Game', 'Sky'], function (Game, Sky) {
  var context = Game.skyContext;
  var centerX = Game.GameWidth / 2;
  var centerY = Game.GameHeight / 2 - 20; // to center on text

  var TAU = 2 * Math.PI;

  var count = 26;

  var length = Game.GameWidth * 2;
  var portion = TAU / count;

  var offset = 0;

  var opacity = 0;

  var render = function (delta) {
    var x, y;
    offset += delta % TAU;
    context.save();
    if (opacity < 1) {
      context.globalAlpha = opacity;
      opacity += delta/2;
    } else {
      context.globalAlpha = 1;
    }
    context.fillStyle = 'white';
    context.fillRect(0, 0, Game.GameWidth, Game.GameHeight);
    context.fillStyle = 'yellow';
    for (var i = 0; i < count; i++) {
      var start = 2 * i * portion + offset/2;
      var end = start + portion;
      context.beginPath(centerX, centerY);
      x = Math.cos(start);
      y = Math.sin(start);
      context.lineTo(centerX + x * length, centerY + y * length);
      x = Math.cos(end);
      y = Math.sin(end);
      context.lineTo(centerX + x * length, centerY + y * length);
      context.lineTo(centerX, centerY);
      context.closePath();
      context.fill();
    }
    Sky.dirty = true;
    context.restore();
  };

  var spawned = function () {
    opacity = 0;
  };

  // without this it won't get removed when a new game starts
  var die = function () {
  };

  var Winning = {
    render:   render,
    spawned:  spawned,
    die:      die,
    visible:  true,
    onScreen: true,
    z: 400
  };

  return Winning;
});
