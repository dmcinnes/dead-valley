// Inventory

define(['game'], function (game) {
  var $inv = $('#inventory');

  game.controls.registerKeyDownHandler('i', function () {
    $inv.toggle();
  });
});
