// Inventory

define(['game'], function (game) {
  var $inv = $('#inventory');

  game.controls.registerKeyDownHandler('i', function () {
    $inv.toggle();
  });

  game.controls.registerKeyDownHandler('esc', function () {
    $inv.hide();
  });

  return {
  };
});
