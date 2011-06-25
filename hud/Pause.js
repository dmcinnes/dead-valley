define(['game'], function (game) {
  var parseNode = $('#pause');

  game.events.subscribe('pause', function () {
    parseNode.show();
  }).subscribe('play', function () {
    parseNode.hide();
  });
});
