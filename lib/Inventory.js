// Inventory

define(['Game', 'EventMachine'], function (Game, EventMachine) {
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
           x + width - 1 < inv.width &&
           y + height - 1 < inv.height;
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


  var Inventory = function (config) {
    this.name   = config.name;
    this.width  = config.width;
    this.height = config.height;
    this.touch  = config.touch || false; // don't allow touch access by default
    this.slots  = [];
    this.items  = [];
    setupSlots(this);
  };

  Inventory.prototype = {
    isAvailable: function (item, x, y) {
      return checkRange(x, y, item.width, item.height, this) &&
             slotIterator(x, y, item.width, item.height, this.slots, function (slot) {
               return !slot;
             });
    },

    // if the item at this position overlays a single object, return it
    // otherwise return null
    singleItemOverlay: function (item, x, y) {
      var found = null;
      if (checkRange(x, y, item.width, item.height, this)) {
        slotIterator(x, y, item.width, item.height, this.slots, function (slot) {
          if (found && slot && slot !== found) {
            found = null;
            return false;
          }
          if (slot) {
            found = slot;
          }
        });
      }
      return found;
    },

    addItem: function (item, x, y) {
      if (this.isAvailable(item, x, y)) {
        var self = this;
        slotIterator(x, y, item.width, item.height, this.slots, function (slot, i, j) {
          self.slots[i][j] = item;
        });
        item.x = x;
        item.y = y;
        item.inventory = this;
        this.items.push(item);
        this.fireEvent('itemAdded', item);
        return true;
      }
      return false;
    },

    removeItemAt: function (x, y) {
      var item = this.slots[x][y];
      if (item) {
        this.removeItem(item);
      }
    },

    removeItem: function (item) {
      if (typeof(item.x) === 'number' && typeof(item.y) === 'number') {
        var self = this;
        slotIterator(item.x, item.y, item.width, item.height, this.slots, function (slot, i, j) {
          self.slots[i][j] = null;
        });
        this.items.splice(this.items.indexOf(item), 1);

        this.fireEvent('itemRemoved', item);

        item.x = null;
        item.y = null;
        item.inventory = null;
      }
    },

    itemAt: function (x, y) {
      return this.slots[x][y];
    },

    // try to fit the item in,
    // return true if successful, false otherwise
    stuffItemIn: function (item) {
      var self = this;
      var added = false;

      if (item.stackable) {
        var accepts = _.filter(this.items, function (testItem) {
                        return testItem.stackable && testItem.acceptsDrop(item);
                      });
        for (var i = 0; i < accepts.length; i++) {
          accepts[i].accept(item);
          if (!item.viable()) {
            return true;
          }
        }
      }

      slotIterator(0,
                   0,
                   this.width - item.width + 1,
                   this.height - item.height + 1,
                   this.slots,
                   function (slot, i, j) {
                     if (self.addItem(item, i, j)) {
                       added = true;
                       return false; // break
                     }
                   });

      return added;
    },

    findItem: function (clazz) {
      return _.detect(this.items, function (item) {
        return item instanceof clazz;
      });
    },

    clear: function () {
      _.each(this.items, function (item) {
        this.removeItem(item);
      }, this);
      this.slots.length = 0;
      this.items.length = 0;
      setupSlots(this);
    },

    // for marshalling inventory
    setInventory: function (items) {
      var self = this;
      _.each(items, function (itemData) {
        require(['inventory/'+itemData.clazz], function (InventoryClass) {
          var item = new InventoryClass();
          for (var val in itemData) {
            item[val] = itemData[val];
          }
          if (itemData.x !== undefined &&
              itemData.y !== undefined) {
            self.addItem(item, itemData.x, itemData.y);
          } else {
            self.stuffItemIn(item);
          }
        });
      });
    },

    saveMetadata: function () {
      var itemList = _.map(this.items, function (item) {
        return item.saveMetadata();
      });

      return {
        name:         this.name,
        setInventory: itemList
      };
    }
  };

  EventMachine(Inventory);

  return Inventory;
});
