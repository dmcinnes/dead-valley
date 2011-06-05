// Inventory

define(['game'], function (game) {
  var $inv = $('#inventory');

  var setupControls = function () {
    game.controls.registerKeyDownHandler('i', function () {
      $inv.toggle();
    });

    game.controls.registerKeyDownHandler('esc', function () {
      $inv.hide();
    });
  };

  var inHand = null;

  var putInHand = function (object) {
    inHand = object;
  };

  setupControls();

  return {
    inHand: function () { return inHand },
    putInHand: putInHand
  };
});
