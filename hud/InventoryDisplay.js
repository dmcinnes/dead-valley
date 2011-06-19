// Inventory Display
define(['game', 'Inventory'], function (game, Inventory) {
  var setupControls = function (parentNode, inventory) {
    game.controls.registerKeyDownHandler('i', function () {
      parentNode.toggle();
    });

    game.controls.registerKeyDownHandler('esc', function () {
      parentNode.hide();
    });

    parentNode.find('td').live('click', function (e) {
      var node = $(e.currentTarget);
      var x = node.prevAll().length;
      var y = node.parent().prevAll().length;
      inventory.removeItemAt(x, y);
    });
  };

  var setupEventHandlers = function (table, inventory) {
    inventory.subscribe('itemRemoved', function (item) {
      removeItem(table, item);
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
    return table;
  };

  var renderItem = function (table, item) {
    var i, j;
    var x = item.x;
    var y = item.y;
    var start = table.find("tr:eq("+y+") td:eq("+x+")");
    start.append($("<img/>").attr('src', item.image));
    start.attr('rowspan', item.height);
    start.attr('colspan', item.width);
    for (i = item.width-1; i >= 0; i--) {
      for (j = item.height-1; j >= 0; j--) {
        if (i > 0 || j > 0) { // got to keep the original
          table.find("tr:eq("+y+j+") td:eq("+x+i+")").remove();
        }
      }
    }
  };

  var removeItem = function (table, item) {
    var x = item.x;
    var y = item.y;
    var start = table.find("tr:eq("+y+") td:eq("+x+")");
    start.empty();
    start.removeAttr('rowspan');
    start.removeAttr('colspan');
    var rows = item.width-1;
    var cols = item.height-1;
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        table.find("tr:eq("+y+j+") td:eq("+x+i+")").insertAfter($("<td/>"));
      }
    }
  };

  var updateTable = function (table, inventory) {
    _.each(inventory.items, function (item) {
      renderItem(table, item);
    });
  };

  var InventoryDisplay = function (inventory, parent) {
    this.inventory = inventory;
    this.parent = parent;
    this.table = render(inventory, parent);
    setupControls(parent, inventory);
    setupEventHandlers(parent, inventory);
    updateTable(this.table, inventory);
  };

  return InventoryDisplay;

});
