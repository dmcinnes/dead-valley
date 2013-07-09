define(["Sprite", "Game"], function (Sprite, Game) {

  var $container = $('#container');

  var GasPumpSprite = function (model) {
    this.init(model);
  };
  GasPumpSprite.prototype = new Sprite();

  Game.events.subscribe('fuel source active', function (source) {
    if (source.isGasPump) {
      $container.addClass('pump');
    }
  });
  Game.events.subscribe('fuel source inactive', function (source) {
    $container.removeClass('pump');
  });

  return GasPumpSprite;
});
