// Blood Splatters!

define(['Game', 'models/Splatter'], function (Game, Splatter) {

  var currentSplats = [];
  var maxSplats     = 10; // number of splats on the screen at a time

  var splat = function (pos, color, strength) {
    var splatter = new Splatter(pos, color, strength);
    Game.addSprite(splatter);
    // keep track of existing splats
    currentSplats.push(splatter);
    if (currentSplats.length > maxSplats) {
      var reclaimed = currentSplats.shift();
      reclaimed.die();
    }
  };

  return {
    splat: splat
  };

});
