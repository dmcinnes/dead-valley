// Dude Hands Inventory Display
define(['Game',
       'Inventory',
       'hud/InventoryDisplay'],
       function (Game, Inventory, InventoryDisplay) {

  // little hacky -- should make this nicer

  return function (div) {
    var dudeHands =
      new InventoryDisplay(Game.dude.hands,
                           div,
                           { id:'dude-hands',
                             doubleClickTarget: Game.dude.inventory });

    // override the renderItem method
    dudeHands.renderItem = function (item) {
      var displayNode = InventoryDisplay.prototype.renderItem.call(this, item);

      // change the top pos of the node to center it in the hand
      var height = item.height * (this.cellSize - this.itemOffset.top);
      var offset = (this.table.innerHeight() - height) / 2;
      var pos = displayNode.position();
      displayNode.css('top', pos.top + offset);
 
      // mark all covered nodes as occupied
      for (var i = 0; i < item.width; i++) {
        for (var j = 0; j < this.inventory.height; j++) {
          this.table.find("tr:eq("+(item.y+j)+") td:eq("+(item.x+i)+")").addClass('occupied');
        }
      }

      return displayNode;
    };

    dudeHands.removeItem = function (item) {
      InventoryDisplay.prototype.removeItem.call(this, item);

      // clear the extra occupied nodes
      for (i = 0; i < item.width; i++) {
        for (j = 0; j < this.inventory.height; j++) {
          this.table.find("tr:eq("+(item.y+j)+") td:eq("+(item.x+i)+")").removeClass('occupied');
        }
      }
    };

    // reset the event handlers
    dudeHands.clearEventHandlers();
    dudeHands.setupEventHandlers();

    // re-render the items after page load
    _.each(dudeHands.inventory.items, function (item) {
      dudeHands.removeItem(item);
      dudeHands.renderItem(item);
    });

    return dudeHands;
  };
});
