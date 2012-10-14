define(['Game', 'GameTime', 'Vector'], function (Game, GameTime, Vector) {

  var time, direction, position, rotation;

  var transformKey = Modernizr.prefixed('transform');

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
          transform += ' translateZ(999px)';
        }
        $nuke.css(transformKey, transform);
      }
    },
    die: function () {
      $nuke.hide();
    },
    pos: null,
    visible: true,
    onScreen: true,
    z: 999
  };

  GameTime.subscribe('target time passed', function () {
    Game.sprites.push(Nuke);

    time = 0;

    var dude = Game.dude;
    var pos = dude.driving ? dude.driving.pos : dude.pos;

    direction = pos.subtract(Game.startPosition).normalize();
    direction.retain();
    position = direction.multiply(-Game.GameWidth).translate(Vector.create(Game.GameWidth/2, Game.GameHeight/2));
    position.retain();
    rotation = direction.angle();

    $nuke.show();
  });

});
