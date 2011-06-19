// Inventory

define(['game', 'eventmachine'], function (game, eventMachine) {
  var inHand = null;

  var slots = [];
  var WIDTH  = 9;
  var HEIGHT = 3;

  var setupSlots = function (width, height) {
    var i, j;
    for (i = 0; i < width; i++) {
      slots[i] = [];
      for (j = 0; j < height; j++) {
        slots[i].push(null);
      }
    }
  };

  var checkRange = function (x, y, width, height) {
    return x >= 0 &&
           y >= 0 &&
           width >= 0 &&
           height >= 0 &&
           x + width < WIDTH &&
           y + height < HEIGHT;
  };

  var slotIterator = function (x, y, width, height, callback) {
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


  var Inventory = {
    putInHand: function (item) {
      inHand = item;
      this.fireEvent('itemPutInHand', item);
    },

    removeFromHand: function () {
      this.fireEvent('itemRemovedFromHand', inHand);
      inHand = null;
    },

    inHand: function () {
      return inHand;
    },

    isAvailable: function (item, x, y) {
      return checkRange(x, y, item.width, item.height) &&
             slotIterator(x, y, item.width, item.height, function (slot) {
               return !slot;
             });
    },

    addItem: function (item, x, y) {
      if (this.isAvailable(item, x, y)) {
        slotIterator(x, y, item.width, item.height, function (slot, i, j) {
          slots[i][j] = item;
        });
        this.fireEvent('itemAdded', item, x, y);
      }
    },

    removeItem: function (item) {
      // where does the item start
      var x, y;
      slotIterator(0, 0, WIDTH, HEIGHT, function (slot, i, j) {
        if (slot === item) {
          x = i;
          y = j;
          return false;
        }
      });
      if (x && y) {
        slotIterator(x, y, item.width, item.height, function (slot, i, j) {
          slots[i][j] = null;
        });
        this.fireEvent('itemRemoved', item, x, y);
      }
    }
  };

  eventMachine(Inventory);

  setupSlots(WIDTH, HEIGHT);

  return Inventory;
});
