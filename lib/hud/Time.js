define(['GameTime'], function (GameTime) {
  var node = $('#time');

  var lastTime = null;

  var renderCurrentTime = function () {
    var time = GameTime.gameTime();

    if (lastTime !== time.hours) {
      var pm = time.hours > 11;
      var hours = pm ? time.hours - 12 : time.hours;

      var out = [hours || '12'];

      out.push(pm ? ' PM' : ' AM');

      node.text(out.join(''));

      lastTime = time.hour;
    }
  };

  return {
    postMove: renderCurrentTime,
    visible: true
  };
});
