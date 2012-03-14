// Distance travelled HUD element

define(['Game'], function (Game) {

  var node = $('#distance');

  var target = Game.targetMiles;

  var currentDistance = -1;

  return {
    postMove: function (delta) {
      if (Game.dude) {
	var distance = Game.dude.distanceFromOrigin();
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
