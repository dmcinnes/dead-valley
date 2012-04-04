define(['GameTime'], function (GameTime) {
  var node = $('#time');

  var lastTime = null;
  var renderTime = false;

  node.click(function (e) {
    e.preventDefault();
    renderTime = !renderTime;
    node.toggleClass('clock');
    render(true);
  });

  var renderRemaining = function (force) {
    var time = GameTime.gameTimeRemaining();

    if (time.time <= 0) {
      node.text('Elapsed');
    } else if (lastTime !== time.minutes || force) {
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
  };

  var renderCurrentTime = function (force) {
    var time = GameTime.gameTime();

    if (lastTime !== time.hours || force) {
      var pm = time.hours > 11;
      var hours = pm ? time.hours - 12 : time.hours;

      var out = [hours || '12'];

      out.push(pm ? ' PM' : ' AM');

      node.text(out.join(''));

      lastTime = time.hour;
    }
  };

  var render = function (force) {
    if (renderTime || GameTime.targetTime() === null) {
      renderCurrentTime(force);
    } else {
      renderRemaining(force);
    }
  };

  return {
    postMove: function (delta) {
      render();
    },
    visible: true
  };
});
