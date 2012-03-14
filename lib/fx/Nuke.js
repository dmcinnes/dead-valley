define(['Game', 'GameTime', 'Vector'], function (Game, GameTime, Vector) {

  var time, direction, position, rotation;

  var duration = 0.5; // seconds

  var $nuke = $('#nuke');

  var Nuke = {
    integrate: function (delta) {
      if (time < duration) {
        time += delta;
        var transform = 'translate('+position.x+'px, '+position.y+'px)';
        transform += ' rotate('+rotation+'rad)';
        transform += ' scaleX('+time/duration+')';
        if (Game.threeDee) {
          transform += ' translateZ(0)';
        }
        $nuke.css('-webkit-transform', transform);
      }
    },
    die: function () {
      $nuke.hide();
    },
    pos: null,
    visible: true,
    onScreen: true
  };

  GameTime.subscribe('target time passed', function () {
    Game.sprites.push(Nuke);

    time = 0;

    var dude = Game.dude;
    var pos = dude.driving ? dude.driving.pos : dude.pos;

    direction = pos.subtract(Game.startPosition).normalize();
    position = direction.multiply(-Game.GameWidth).translate(new Vector(Game.GameWidth/2, Game.GameHeight/2));
    rotation = Math.atan2(direction.y, direction.x);

    $nuke.show();
  });

});
