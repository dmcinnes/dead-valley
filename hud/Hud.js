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
      otherInventoryDisplay = new InventoryDisplay(otherInventory, $otherInventoryDiv);
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
    dudeInventory = new InventoryDisplay(game.dude.inventory, $dudeInventoryDiv);
    dudeHands = new InventoryDisplay(DudeHands, $dudeInventoryDiv, { id:'dude-hands' });
  });

  // framerate HUD
  game.addSprite(Framerate);
});
