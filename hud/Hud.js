// Place where we handle all the HUD interaction details
define(['game', 'hud/InventoryDisplay', 'hud/LifeMeter', 'hud/Pause', 'hud/Framerate', 'Firearm'],
       function (game, InventoryDisplay, LifeMeter, Pause, Framerate, Firearm) {

  var dudeInventory, dudeHands;
  var inventoryShown = false;
  var $dudeInventoryDiv = $('#dude-inventory');
  var $otherInventoryDiv = $('#other-inventory');
  var otherInventory = null;
  var otherInventoryDisplay = null;

  var updateOtherInventory = function () {
    if (game.dude.inside) {
      otherInventory = game.dude.inside.inventory;
    } else if (game.dude.driving) {
      otherInventory = game.dude.driving.inventory;
    } else {
      var touchList = game.dude.touching;
      for (var i = 0; i < touchList.length; i++) {
	var inv = touchList[i].inventory;
	if (inv && inv.touch) {
	  otherInventory = inv;
	}
      }
    }
  };

  var removeOtherInventory = function () {
    if (otherInventory) {
      otherInventoryDisplay.clearEventHandlers();
      otherInventoryDisplay = null;
      otherInventory = null;
      $otherInventoryDiv.empty();
    }
  };

  var showInventory = function () {
    dudeInventory.show();
    dudeHands.show();
    if (otherInventory) {
      otherInventoryDisplay = new InventoryDisplay(otherInventory,
                                                   $otherInventoryDiv,
                                                   { doubleClickTarget:game.dude.inventory });
      otherInventoryDisplay.show();
    }
    inventoryShown = true;
  };
  
  var hideInventory = function () {
    dudeInventory.hide();
    dudeHands.hide();
    removeOtherInventory();
    inventoryShown = false;
  };

  game.events.subscribe('toggle inventory', function () {
    if (inventoryShown) {
      hideInventory();
    } else {
      updateOtherInventory();
      showInventory();
    }
  }).subscribe('hide inventory', function () {
    hideInventory();
  }).subscribe('enter building', function (building) {
    otherInventory = building.inventory;
    showInventory();
  }).subscribe('leave building', function (building) {
    removeOtherInventory();
  }).subscribe('enter car', function (car) {
    // if (inventoryShown) {
    //   otherInventory = car.inventory;
    //   showInventory();
    // }
  }).subscribe('leave car', function (car) {
    removeOtherInventory();
  }).subscribe('new dude', function (dude) {
    $dudeInventoryDiv.empty();
    dudeInventory = new InventoryDisplay(game.dude.inventory,
                                         $dudeInventoryDiv,
                                         { doubleClickTarget: game.dude.hands });
    dudeHands = new InventoryDisplay(game.dude.hands,
                                     $dudeInventoryDiv,
                                     { id:'dude-hands',
                                       doubleClickTarget: game.dude.inventory });
  });

  // eject ammo on right click
  $("#canvas-mask .inventory .inventory-item").live('mousedown', function (e) {
    if (e.button == 2) { // right click
      var item = $(this).data('item');
      if (item instanceof Firearm && item.ammoType) {
        var count = item.eject();
        if (count) {
          var ammo = new item.ammoType(count);
          dudeInventory.restartDrag(ammo, null, e);
        }
      }
      e.preventDefault();
    }
  });

  // framerate HUD
  game.addSprite(Framerate);
});
