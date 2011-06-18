// Inventory Display
define(['game', 'Inventory'], function (game, Inventory) {
  var $inv = $('#inventory');

  var setupControls = function () {
    game.controls.registerKeyDownHandler('i', function () {
      $inv.toggle();
    });

    game.controls.registerKeyDownHandler('esc', function () {
      $inv.hide();
    });
  };

  setupControls();

});
