// Distance travelled HUD element

define(['Game'], function (Game) {

  var node = $('#distance');

  var target = Game.targetMiles;

  var currentDistance = -1;

  return {
    postMove: function (delta) {
      var sprite = Game.dude.driving || Game.dude;
      if (sprite && sprite.pos) {
	var distance = sprite.pos.magnitude() / 15840;
        if (distance !== currentDistance) {
          currentDistance = distance;
          distance = Math.round(10 * (target - distance)) / 10;
          node.text(distance + " Miles to go");
        }
      }
    },
    visible: true
  };
});
