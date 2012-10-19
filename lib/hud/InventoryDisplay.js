// Inventory Display
define(['Game', 'Inventory', 'sprites/InventorySprite'], function (Game, Inventory, InventorySprite) {

  var draggingItem, draggingItemOriginalPos, draggingItemOriginalInv,
      currentDraggable, currentDraggableOffset, containerOffset;

  var $draggingContainer = $('#container');

  var updateContainerOffset = function () {
    containerOffset = $draggingContainer.offset();
  };
  updateContainerOffset();
  $(window).bind('resize', updateContainerOffset);

  var setCurrentDraggablePosition = function (mousex, mousey) {
    currentDraggable.css({
      left: mousex - currentDraggableOffset.left - containerOffset.left,
      top:  mousey - currentDraggableOffset.top - containerOffset.top
    });
  };

  // drop the inventory on the ground
  var dropInventorySprite = function (e) {
    var coords = Game.map.worldCoordinatesFromWindow(e.pageX, e.pageY);
    var drop = new InventorySprite(draggingItem, coords);
    Game.addSprite(drop);
  };

  $('body').droppable().bind('drop', function (e) {
    if (!Game.dude.inside && !Game.dude.driving) {
      // if the dude's outside drop the item
      dropInventorySprite(e.originalEvent);
    } else {
      // otherwise revert the drag
      draggingItemOriginalInv.addItem(draggingItem,
                                      draggingItemOriginalPos.x,
                                      draggingItemOriginalPos.y);
    }
    draggingItem = null;
    draggingItemOriginalPos = null;
    draggingItemOriginalInv = null;
  }).mousemove(function (e) {
    if (currentDraggable) {
      setCurrentDraggablePosition(e.pageX, e.pageY);
    }
  });

  $draggingContainer.click(function (e) {
    // if we currently have a draggable we need to pass clicks through
    if (currentDraggable) {
      currentDraggable.hide();

      // find the inteded target
      var target = $(document.elementFromPoint(e.pageX, e.pageY)).parents('.inventory');

      // re-show helper
      currentDraggable.show();

      if (target.length) {
        // pass the click on to the intended target
        target.trigger(e);
      } else {
        // no target, drop that sucker
        dropInventorySprite(e);
        clearCurrentDraggable();
      }
    }
  });
 
  var clearCurrentDraggable = function () {
    if (currentDraggable) {
      currentDraggable.remove();
      currentDraggable = currentDraggableOffset = null;
    }
  };

  // drop whatever ya got
  Game.events.subscribe('game over', clearCurrentDraggable);

  /** The InventoryDisplay Object **/

  var InventoryDisplay = function (inventory, parent, config) {
    this.inventory = inventory;
    this.parent    = parent;
    this.config    = config || {};

    this.clicks    = 0;

    this.createTable();

    this.renderAll();
    this.setupEventHandlers();
  };

  InventoryDisplay.prototype = {

    // magic numbers!
    // a single block is 44x44 but some extra crap is put in there
    cellSize: 50,

    itemOffset: {
      top:  3,
      left: 3
    },

    doubleClickTimeout: 200, // in ms


    itemEventHandlers: {
      dragstart: function (event, ui) {
        if (!currentDraggable) { // if we're not already dragging something
          var draggable = $(event.target).closest('.inventory-item');
          if (draggable.parents().hasClass('ui-draggable-disabled')) {
            return false;
          }
          var item = draggable.data('item');
          return item && this.dragStart(item);
        }
      },
      click: function (event) {
        if (!currentDraggable) {
          this.clicks++;
          var self = this;
          if (this.clicks === 1) {
            setTimeout(function () {
              if (self.clicks === 1) {
                self.itemSingleClick(event);
              } else {
                self.itemDoubleClick(event);
              }
              self.clicks = 0;
            }, self.doubleClickTimeout);
          }
        }
        // so the table click handler doesn't fire
        event.stopPropagation();
      }
    },

    tableEventHandlers: {
      drop: function (e, ui) {
        var item;
        // get offset from first td to be more accurate
        // -- table offset includes table header
        var tablePos = $(this.table).find('tr:first td:first').offset();
        var posX = Math.round((ui.offset.left - tablePos.left) / this.cellSize);
        var posY = Math.round((ui.offset.top - tablePos.top) / this.cellSize);

        // clear current draggable if we have one
        clearCurrentDraggable();

        if (this.inventory.isAvailable(draggingItem, posX, posY)) {
          // successful drag!

          // add the item to the inventory
          this.inventory.addItem(draggingItem, posX, posY);

          // remove the draggingItem data
          draggingItem = null;
          draggingItemOriginalPos = null;
          draggingItemOriginalInv = null;

        } else {

          // are we on top of a thing
          item = this.inventory.singleItemOverlay(draggingItem, posX, posY);

          if (item && item.acceptsDrop(draggingItem)) {
            // give it to the thing
            item.accept(draggingItem);

            // only restart the drag if there's something to drag after the drop
            if (draggingItem.viable()) {
              this.restartDrag(draggingItem, currentDraggableOffset, e);
            }
          } else if (item) {
            // swap em

            // save off the draggingItem, clickDragStart overwrites it
            var newItem = draggingItem;

            // start dragging the dropped on thing
            this.restartDrag(item, null, e);

            // add the dropped item to the inventory
            this.inventory.addItem(newItem, posX, posY);
          } else {
            // restart dragging the dropped thing
            this.restartDrag(draggingItem, currentDraggableOffset, e);
          }
        }
        // stop the drop event from bubbling to the body
        e.stopPropagation();
      },

      click: function (e) {
        // if we're click dragging something drop it on this table
        if (currentDraggable) {
          this.tableEventHandlers.drop.call(this, e, { offset: currentDraggable.offset() });
        }
      }
    },

    setupEventHandlers: function () {
      this.inventory.subscribe('itemAdded', this.renderItem, this);
      this.inventory.subscribe('itemRemoved', this.removeItem, this);

      var self = this;
      _.each(this.tableEventHandlers, function (handler, key) {
        self.table.bind(key, $.proxy(handler, self));
      });
    },

    setupItemEventHandlers: function (itemNode) {
      var self = this;
      _.each(this.itemEventHandlers, function (handler, key) {
        itemNode.bind(key, $.proxy(handler, self));
      });
    },

    clearEventHandlers: function () {
      this.inventory.unsubscribe('itemAdded', this.renderItem);
      this.inventory.unsubscribe('itemRemoved', this.removeItem);

      var self = this;
      _.each(this.tableEventHandlers, function (handler, key) {
        self.table.unbind(key);
      });
    },

    // create the table markup
    createTable: function () {
      var i, j, row, td;
      var rowCount = this.inventory.height;
      var colCount = this.inventory.width;
      var table = $("<table/>").addClass("inventory");
      table.attr('id', this.config.id);

      if (this.inventory.name) {
        var caption = $("<caption/>");
        caption.text("Inside " + this.inventory.name);
        table.append(caption);
      }

      for (i = 0; i < rowCount; i++) {
        row = $("<tr/>");
        for (j = 0; j < colCount; j++) {
          td = $("<td/>");
          row.append(td);
        }
        table.append(row);
      }

      table.droppable({
        greedy:    true,
        tolerance: 'touch'
      });

      this.parent.append(table);
      this.table = table;

      // disable context menu
      table[0].oncontextmenu = function() {
        return false;
      };
    },

    // render an item at a place
    renderItem: function (item) {
      var i, j;
      var x = item.x;
      var y = item.y;
      var start = this.table.find("tr:eq("+y+") td:eq("+x+")");
      var pos = start.position();
      var displayNode = item.displayNode();
      displayNode.css({left:pos.left + this.itemOffset.left, top:pos.top + this.itemOffset.top});
      displayNode.addClass('inventory-item');
      var containerId = '#' + $draggingContainer.attr('id');
      displayNode.draggable({
        helper:      'clone',
        appendTo:    containerId,
        containment: containerId,
        scroll:      false
      });
      displayNode.data('item', item);
      this.setupItemEventHandlers(displayNode);
      start.append(displayNode);
      for (i = 0; i < item.width; i++) {
        for (j = 0; j < item.height; j++) {
          this.table.find("tr:eq("+(y+j)+") td:eq("+(x+i)+")").addClass('occupied');
        }
      }

      // disable context menu
      displayNode[0].oncontextmenu = function() {
        return false;
      };

      return displayNode;
    },

    // remove the item from its place
    removeItem: function (item) {
      var x = item.x;
      var y = item.y;
      var start = this.table.find("tr:eq("+y+") td:eq("+x+")");
      start.empty();
      for (i = 0; i < item.width; i++) {
        for (j = 0; j < item.height; j++) {
          this.table.find("tr:eq("+(y+j)+") td:eq("+(x+i)+")").removeClass('occupied');
        }
      }
    },

    // render all the items in the associated Inventory
    renderAll: function () {
      _.each(this.inventory.items, function (item) {
        this.renderItem(item);
      }, this);
    },

    // this is run when we start the drag
    dragStart: function (item) {
      if (item.movable) {
        draggingItem = item;
        // remember the original position in case we need to abort
        draggingItemOriginalPos = {
          x: draggingItem.x,
          y: draggingItem.y
        };
        // also remember which inventory we came from
        draggingItemOriginalInv = this.inventory;
        // finally remove the draggable item from the inventory
        this.inventory.removeItem(draggingItem);
      }

      return !!item.movable;
    },

    // this is run when we start the drag on a click
    clickDragStart: function (item, offset, event) {
      if (item.movable) {
        // create a 'helper' object to follow the mouse around
        currentDraggable = item.displayNode().clone();
        currentDraggable.addClass('inventory-item click-dragging');
        // disable context menu
        currentDraggable[0].oncontextmenu = function() {
          return false;
        };
        // keep track of the offset so we render the dragging correctly
        currentDraggableOffset = offset;

        // if we have an event, set the offset
        if (event) {
          var originalEvent = event.originalEvent;
          setCurrentDraggablePosition(originalEvent.pageX, originalEvent.pageY);
        }

        // finish the start of the drag as a draggable
        this.dragStart(item);

        $draggingContainer.append(currentDraggable);
      }
    },

    restartDrag: function (item, offset, event) {
      // figure out the offset -- center it
      offset = offset || {
        left: (this.cellSize/2) * item.width,
        top:  (this.cellSize/2) * item.height
      };
      // restart dragging the dropped thing
      this.clickDragStart(item, offset, event);
    },

    // start a drag
    itemSingleClick: function (event) {
      var target = $(event.target).parentsUntil('td').andSelf().filter('.inventory-item');
      var pos = target.offset();
      this.clickDragStart(
        target.data('item'),
        {left:event.pageX - pos.left, top:event.pageY - pos.top},
        event
      );
    },

    // send the double clicked target to the configured inv
    itemDoubleClick: function (event) {
      var targetInventory = this.config.doubleClickTarget;
      if (targetInventory) {
        var target = $(event.target).parentsUntil('td').andSelf().filter('.inventory-item');
        var item = target.data('item');
        if (item.movable) {
          // save off the current coords
          var x = item.x;
          var y = item.y;
          this.inventory.removeItem(item);
          if (!targetInventory.stuffItemIn(item)) {
            // if it doesn't work out, add it back
            this.inventory.addItem(item, x, y);
          }
        }
      }
    },

    active: function (inventoryShown) {
      return inventoryShown ||
             Game.dude.inside && Game.dude.inside.inventory === this.inventory;
    },

    show: function () {
      this.parent.css('visibility', 'visible');
    },

    hide: function () {
      this.parent.css('visibility', 'hidden');
    }

  };

  return InventoryDisplay;
});
