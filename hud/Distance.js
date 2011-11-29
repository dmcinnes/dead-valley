// Distance travelled HUD element

define(['Game'], function (Game) {

  var node = $('#distance');

  var target = Game.targetMiles;

  return {
    postMove: function (delta) {
      var sprite = Game.dude.driving || Game.dude;
      if (sprite && sprite.pos) {
	var distance = Math.round(sprite.pos.magnitude() * 10 / 15840);
	distance = target - (distance / 10);
	node.text(distance + " Miles to go");
      }
    },
    visible: true
  };
});
