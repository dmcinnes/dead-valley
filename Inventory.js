// Inventory

define(['game', 'eventmachine'], function (game, eventMachine) {
  var setupSlots = function (inv) {
    var i, j;
    for (i = 0; i < inv.width; i++) {
      inv.slots[i] = [];
      for (j = 0; j < inv.height; j++) {
        inv.slots[i].push(null);
      }
    }
  };

  var checkRange = function (x, y, width, height, inv) {
    return x >= 0 &&
           y >= 0 &&
           width >= 0 &&
           height >= 0 &&
           x + width < inv.width &&
           y + height < inv.height;
  };

  var slotIterator = function (x, y, width, height, slots, callback) {
    var i, j, indexx, indexy;
    for (i = 0; i < width; i++) {
      for (j = 0; j < height; j++) {
        // drop out if the callback returns false
        indexx = i + x;
        indexy = j + y;
        if (callback(slots[indexx][indexy], indexx, indexy) === false) {
          return false;
        }
      }
    }
    return true;
  };


  var Inventory = function (width, height) {
    this.slots = [];
    this.width = width;
    this.height = height;
    setupSlots(this);
  };

  Inventory.prototype = {
    isAvailable: function (item, x, y) {
      return checkRange(x, y, item.width, item.height, this) &&
             slotIterator(x, y, item.width, item.height, slots, function (slot) {
               return !slot;
             });
    },

    addItem: function (item, x, y) {
      if (this.isAvailable(item, x, y)) {
        slotIterator(x, y, item.width, item.height, slots, function (slot, i, j) {
          slots[i][j] = item;
        });
        this.fireEvent('itemAdded', item, x, y);
      }
    },

    removeItem: function (item) {
      // where does the item start
      var x, y;
      slotIterator(0, 0, WIDTH, HEIGHT, slots, function (slot, i, j) {
        if (slot === item) {
          x = i;
          y = j;
          return false;
        }
      });
      if (x && y) {
        slotIterator(x, y, item.width, item.height, slots, function (slot, i, j) {
          slots[i][j] = null;
        });
        this.fireEvent('itemRemoved', item, x, y);
      }
    }
  };

  eventMachine(Inventory);

  return Inventory;
});
