define(['GameTime'], function (GameTime) {
  var node = $('#time');

  var lastMinute = null;
  var colon = true;
  var renderTime = false;
  var forceRender = false;

  node.click(function (e) {
    e.preventDefault();
    renderTime = !renderTime;
    forceRender = true;
  });

  var renderRemaining = function (force) {
    var time = GameTime.gameTimeRemaining();

    if (time.time <= 0) {
      node.text('Elapsed');
    } else if (lastMinute !== time.minutes || force) {
      colon = !colon;

      var out = [time.days]
      out.push((time.days == 1) ? ' Day ' : ' Days ');

      out.push(time.hours || '00');

      out.push((colon) ? ':' : ' ');

      if (time.minutes < 10) {
	out.push('0');
      }
      out.push(time.minutes);

      lastMinute = time.minutes;
      node.text(out.join(''));
    }
  };

  var renderCurrentTime = function (force) {
    var time = GameTime.gameTime();

    if (lastMinute !== time.minutes || force) {
      colon = !colon;

      var pm = time.hours > 11;
      var hours = pm ? time.hours - 12 : time.hours;

      var out = [hours || '12'];

      out.push((colon) ? ':' : ' ');

      if (time.minutes < 10) {
	out.push('0');
      }
      out.push(time.minutes);

      out.push(pm ? ' PM' : ' AM');

      lastMinute = time.minutes;
      node.text(out.join(''));
    }
  };

  return {
    postMove: function (delta) {
      if (renderTime) {
	renderCurrentTime(forceRender);
      } else {
	renderRemaining(forceRender);
      }
      forceRender = false;
    },
    visible: true
  };
});
