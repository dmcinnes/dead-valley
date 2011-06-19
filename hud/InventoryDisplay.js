// Inventory Display
define(['game', 'Inventory'], function (game, Inventory) {
  var setupControls = function ($node) {
    game.controls.registerKeyDownHandler('i', function () {
      $node.toggle();
    });

    game.controls.registerKeyDownHandler('esc', function () {
      $node.hide();
    });
  };

  var render = function (inv, parent) {
    var i, j;
    var row
    var table = $("<table/>").addClass("inventory");
    for (i = 0; i < inv.height; i++) {
      row = $("<tr/>");
      for (j = 0; j < inv.width; j++) {
        row.append($("<td/>"));
      }
      table.append(row);
    }
    parent.append(table);
  };

  var InventoryDisplay = function (inventory, parent) {
    this.inventory = inventory;
    this.parent = parent;
    render(inventory, parent);
    setupControls(parent);
  };

  return InventoryDisplay;

});
