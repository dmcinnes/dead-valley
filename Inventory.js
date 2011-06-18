// Inventory

define(['game'], function (game) {
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

  var putInHand = function (object) {
    inHand = object;
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

  var isAvailable = function (item, x, y) {
    return checkRange(x, y, item.width, item.height) &&
           slotIterator(x, y, item.width, item.height, function (slot) {
             return !slot;
           });
  };

  var addItem = function (item, x, y) {
    if (isAvailable(item, x, y)) {
      slotIterator(x, y, item.width, item.height, function (slot, i, j) {
        slots[i][j] = item;
      });
    }
  };

  var removeItem = function (item) {
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
    }
  };

  setupSlots(WIDTH, HEIGHT);

  return {
    inHand: function () { return inHand },
    putInHand: putInHand,
    addItem: addItem,
    removeItem: removeItem,
    isAvailable: isAvailable
  };
});
