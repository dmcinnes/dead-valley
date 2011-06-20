// Inventory Display
define(['game', 'Inventory'], function (game, Inventory) {

  var draggingItem = null;

  var findCellPosition = function (cell) {
    // TODO nicer way of finding this?
    return {
      x: cell.prevAll().length,
      y: cell.parent().prevAll().length
    }
  };


  var InventoryDisplay = function (inventory, parent) {
    this.inventory = inventory;
    this.parent = parent;

    this.setupControls();
    this.createTable();
    this.updateTable();
    this.setupEventHandlers();
  };

  InventoryDisplay.prototype = {

    itemEventHandlers: {
      dragstart: function (event, ui) {
        console.log("drag start!", event, ui);
        var image = $(event.target);
        draggingItem = image.data('item');
        this.inventory.removeItem(draggingItem);
      }
    },

    tableEventHandlers: {
      drop: function (event, ui) {
        var targetCell = $(event.target);
        var pos = findCellPosition(targetCell);
        console.log("dropped!", event, ui, pos.x, pos.y);
        if (this.inventory.isAvailable(draggingItem, pos.x, pos.y)) {
          this.inventory.addItem(draggingItem, pos.x, pos.y);
        } else {
          // put it back where it was
          this.inventory.addItem(draggingItem, draggingItem.x, draggingItem.y);
        }
        draggingItem = null;
        return true;
      }
    },

    setupControls: function () {
      var self = this;

      // TODO this should only be for the Dude's inventory
      game.controls.registerKeyDownHandler('i', function () {
        self.parent.toggle();
      });

      game.controls.registerKeyDownHandler('esc', function () {
        self.parent.hide();
      });
    },

    setupEventHandlers: function () {
      var self = this;

      this.inventory.subscribe('itemAdded', $.proxy(this.renderItem, this));

      this.inventory.subscribe('itemRemoved', $.proxy(this.removeItem, this));

      var items = this.table.find('.inventory-item');
      _.each(this.itemEventHandlers, function (handler, key) {
        items.bind(key, $.proxy(handler, self));
      });

      var cells = this.table.find('td');
      _.each(this.tableEventHandlers, function (handler, key) {
        cells.bind(key, $.proxy(handler, self));
      });

      var body = $('body');
      _.each(this.bodyEventHandlers, function (handler, key) {
        cells.bind(key, $.proxy(handler, self));
      });
    },

    createTable: function () {
      var i, j, row, td;
      var rowCount = this.inventory.height;
      var colCount = this.inventory.width;
      var table = $("<table/>").addClass("inventory");
      for (i = 0; i < rowCount; i++) {
        row = $("<tr/>");
        for (j = 0; j < colCount; j++) {
          td = $("<td/>");
          td.droppable();
          row.append(td);
        }
        table.append(row);
      }
      this.parent.append(table);
      this.table = table;
    },

    renderItem: function (item) {
      var i, j, row, col;
      var x = item.x;
      var y = item.y;
      var start = this.table.find("tr:eq("+y+") td:eq("+x+")");
      var image = $("<img/>").attr('src', item.image).addClass('inventory-item');
      image.draggable({
        helper: 'clone',
        appendTo: 'body'
      });
      image.data('item', item);
      start.append(image);
      start.attr('rowspan', item.height);
      start.attr('colspan', item.width);
      for (i = item.width-1; i >= 0; i--) {
        for (j = item.height-1; j >= 0; j--) {
          if (i > 0 || j > 0) { // got to keep the original
            row = y + j;
            col = x + i;
            this.table.find("tr:eq("+row+") td:eq("+col+")").remove();
          }
        }
      }
    },

    removeItem: function (item) {
      var i, j, row, col, node;
      var x = item.x;
      var y = item.y;
      var start = this.table.find("tr:eq("+y+") td:eq("+x+")");
      start.empty();
      start.removeAttr('rowspan');
      start.removeAttr('colspan');
      var rows = item.height;
      var cols = item.width;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          if (i > 0 || j > 0) { // kept the original
            row = y + j;
            col = x + i;
            node = this.table.find("tr:eq("+row+") td:eq("+col+")");
            if (node.length) {
              node.before($("<td/>"));
            } else {
              // end of the row
              this.table.find("tr:eq("+row+")").append($("<td/>"));
            }
          }
        }
      }
    },

    updateTable: function () {
      _.each(this.inventory.items, function (item) {
        this.renderItem(item);
      }, this);
    }
  };

  return InventoryDisplay;

});
