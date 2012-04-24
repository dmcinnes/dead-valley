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
          if (distance >= 0) {
            var miles = (distance === 1) ? " Mile" : " Miles";
            node.text(distance + miles + " to go");
          }
        }
      }
    },
    visible: true
  };
});
