define(['Game', 'GameTime'], function (Game, GameTime) {
  var node = $('#time-remaining');

  var lastTime = null;

  var TimeRemaining = {
    postMove: function () {
      var time = GameTime.gameTimeRemaining();

      if (time.time <= 0) {
        node.text('Elapsed');
      } else if (lastTime !== time.minutes) {
        var out = [];

        if (time.days > 0) {
          out.push(time.days);
          out.push((time.days == 1) ? 'Day' : 'Days');
        }

        if (time.hours > 0) {
          out.push(time.hours, 'Hours');
        }
        
        if (time.hours === 0 && time.days === 0) {
          out.push(time.minutes, 'Minutes');
        }

        out.push('Remaining');

        lastTime = time.minutes;
        node.text(out.join(' '));
      }
    },
    visible: false
  };

  Game.events.subscribe('game start', function () {
    if (GameTime.targetTime()) {
      node.show();
      TimeRemaining.visible = true;
    } else {
      node.hide();
      TimeRemaining.visible = false;
    }
  });

  return TimeRemaining;
});

