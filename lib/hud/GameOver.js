define(['Game'], function (Game) {
  var overlay   = $('#game-over-overlay');
  var playAgain = $('#play-again');

  var mouseEvents = "click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave";

  overlay.bind(mouseEvents, function (e) {
    e.stopImmediatePropagation();
    return false;
  });

  $('#play-again').click(function (e) {
    e.preventDefault();
    playAgain.hide();
    overlay.fadeOut(2000);
    Game.newGame();
  });

  Game.events.subscribe('game over', function () {
    overlay.fadeIn(5000, function () {
      playAgain.fadeIn(1000);
    });
  });
});
