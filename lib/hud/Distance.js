// Distance travelled HUD element

define(['Game'], function (Game) {

  var node = $('#distance');

  var target = Game.targetMiles;

  var currentDistance = -1;

  return {
    postMove: function (delta) {
      var sprite = Game.dude.driving || Game.dude;
      if (sprite && sprite.pos) {
	var distance = sprite.pos.magnitude() / 1584;
        if (distance !== currentDistance) {
          currentDistance = distance;
          distance = Math.round(target - distance);
          node.text(distance + " Miles to go");
        }
      }
    },
    visible: true
  };
});
