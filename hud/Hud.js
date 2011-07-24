// Place where we handle all the HUD interaction details
define(['game',
       'hud/InventoryDisplay',
       'hud/LifeMeter',
       'hud/Pause',
       'hud/Framerate',
       'hud/FuelGauge',
       'hud/Tip',
       'Firearm'],
       function (game, InventoryDisplay, LifeMeter, Pause, Framerate, FuelGauge, Tip, Firearm) {

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
    if (game.dude.driving) {
      FuelGauge.show(game.dude.driving);
    }
    inventoryShown = true;
  };
  
  var hideInventory = function () {
    dudeInventory.hide();
    dudeHands.hide();
    removeOtherInventory();
    FuelGauge.hide();
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
    // show the building inventory when we enter if inventory is up
    if (inventoryShown) {
      otherInventory = building.inventory;
      showInventory();
    }
  }).subscribe('leave building', function (building) {
    // remove the building inventory when we exit
    removeOtherInventory();
  }).subscribe('enter car', function (car) {
    // only show the fuel gauge inside the car
    if (inventoryShown) {
      FuelGauge.show(car);
      otherInventory = car.inventory;
      showInventory();
    }
  }).subscribe('leave car', function (car) {
    // remove the car inventory when we exit the car
    removeOtherInventory();
    FuelGauge.hide();
  }).subscribe('started touching', function (sprite) {
    // show the car inventory when we touch it if inventory is up
    if (inventoryShown && sprite.isCar) {
      otherInventory = sprite.inventory;
      showInventory();
    }
  }).subscribe('stopped touching', function (sprite) {
    // remove the car inventory when we stop touching it
    if (otherInventory === sprite.inventory) {
      removeOtherInventory();
    }
  }).subscribe('new dude', function (dude) {
    $dudeInventoryDiv.empty();
    dudeInventory = new InventoryDisplay(game.dude.inventory,
                                         $dudeInventoryDiv,
                                         { doubleClickTarget: game.dude.hands });
    dudeHands = new InventoryDisplay(game.dude.hands,
                                     $dudeInventoryDiv,
                                     { id:'dude-hands',
                                       doubleClickTarget: game.dude.inventory });
  }).subscribe('start fueling', function (car) {
    FuelGauge.show(car);
  }).subscribe('stop fueling', function (car) {
    FuelGauge.hide(car);
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
