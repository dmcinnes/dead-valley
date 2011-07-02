// Place where we handle all the HUD interaction details
define(['game', 'hud/InventoryDisplay', 'hud/LifeMeter', 'hud/Pause', 'hud/Framerate', 'DudeHands'],
       function (game, InventoryDisplay, LifeMeter, Pause, Framerate, DudeHands) {

  var dudeInventory, dudeHands;
  var inventoryShown = false;
  var $dudeInventoryDiv = $('#dude-inventory');
  var $otherInventoryDiv = $('#other-inventory');
  var otherInventory = null;
  var otherInventoryDisplay = null;

  var updateOtherInventory = function () {
    var touchList = game.dude.touching;
    for (var i = 0; i < touchList.length; i++) {
      var inv = touchList[i].inventory;
      if (inv) {
        otherInventory = inv;
      }
    }
  };

  var showInventory = function () {
    dudeInventory.show();
    dudeHands.show();
    updateOtherInventory();
    if (otherInventory) {
      otherInventoryDisplay = new InventoryDisplay(otherInventory, $otherInventoryDiv);
      otherInventoryDisplay.show();
    }
    inventoryShown = true;
  };
  
  var hideInventory = function () {
    dudeInventory.hide();
    dudeHands.hide();
    if (otherInventory) {
      otherInventoryDisplay.clearEventHandlers();
      otherInventoryDisplay = null;
      otherInventory = null;
      $otherInventoryDiv.empty();
    }
    inventoryShown = false;
  };

  game.events.subscribe('toggle inventory', function () {
    if (inventoryShown) {
      hideInventory();
    } else {
      showInventory();
    }
  });

  game.events.subscribe('hide inventory', function () {
    hideInventory();
  });

  game.events.subscribe('new dude', function (dude) {
    $dudeInventoryDiv.empty();
    dudeInventory = new InventoryDisplay(game.dude.inventory, $dudeInventoryDiv);
    dudeHands = new InventoryDisplay(DudeHands, $dudeInventoryDiv, { id:'dude-hands' });
  });

  // framerate HUD
  game.addSprite(Framerate);
});
