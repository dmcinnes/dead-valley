define(['Game', 'fx/Hint'], function (Game, Hint) {

  var currentSprite = null;

  var currentTip = null;

  var createNewTip = function (sprite, text) {
    currentTip = Hint.create({
      sprite: sprite,
      fadeDuration: 0,
      text: text
    });
  };

  var setTipText = function (sprite) {
    sprite = sprite || currentSprite;
    var tipText = sprite.tip && sprite.tip();
    if (tipText) {
      if (!currentTip) {
        createNewTip(sprite, tipText);
      } else {
        currentTip.setText(tipText);
      }
      return true;
    }
    return false;
  };

  var removeTip = function () {
    currentTip.die();
    currentTip = null;
    currentSprite.unsubscribe('tip data change', setTipText);
    currentSprite = null;
  };


  Game.events.subscribe('mousedown', function (vec) {
    removeTip();
  }).subscribe('new dude', function (dude) {

    dude.subscribe('started touching', function (sprite) {
      if (setTipText(sprite)) {
        currentSprite = sprite;
        sprite.subscribe('tip data change', setTipText);
      }
    }).subscribe('stopped touching', function (sprite) {
      if (currentSprite === sprite) {
        removeTip();
      }
    });

  });

});
