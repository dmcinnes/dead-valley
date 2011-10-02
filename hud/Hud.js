// Place where we handle all the HUD interaction details
define(['Game',
       'hud/InventoryDisplay',
       'hud/DudeHandsInventoryDisplay',
       'hud/LifeMeter',
       'hud/Pause',
       'hud/Framerate',
       'hud/FuelGauge',
       'hud/Tip',
       'hud/CheckEngineLight',
       'Firearm'],

       function (Game,
                 InventoryDisplay,
                 DudeHandsInventoryDisplay,
                 LifeMeter,
                 Pause,
                 Framerate,
                 FuelGauge,
                 Tip,
                 CheckEngineLight,
                 Firearm) {

  var dudeInventory, dudeHands;
  var inventoryShown = false;
  var $dudeInventoryDiv = $('#dude-inventory');
  var $otherInventoryDiv = $('#other-inventory');
  var otherInventory = null;
  var otherInventoryDisplay = null;

  var updateOtherInventory = function () {
    if (Game.dude.inside) {
      otherInventory = Game.dude.inside.inventory;
    } else if (Game.dude.driving) {
      otherInventory = Game.dude.driving.inventory;
    } else {
      var touchList = Game.dude.touching;
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
                                                   { doubleClickTarget:Game.dude.inventory });
      otherInventoryDisplay.show();
    }
    if (Game.dude.driving) {
      FuelGauge.show(Game.dude.driving);
      CheckEngineLight.show(Game.dude.driving);
    }
    inventoryShown = true;
  };
  
  var hideInventory = function () {
    dudeInventory.hide();
    dudeHands.hide();
    removeOtherInventory();
    FuelGauge.hide();
    CheckEngineLight.hide();
    inventoryShown = false;
  };

  Game.events.subscribe('toggle inventory', function () {
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
      CheckEngineLight.show(car);
      otherInventory = car.inventory;
      showInventory();
    }
  }).subscribe('leave car', function (car) {
    // remove the car inventory when we exit the car
    removeOtherInventory();
    FuelGauge.hide();
    CheckEngineLight.hide();
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
    dudeInventory = new InventoryDisplay(Game.dude.inventory,
                                         $dudeInventoryDiv,
                                         { doubleClickTarget: Game.dude.hands });
    dudeHands = DudeHandsInventoryDisplay($dudeInventoryDiv);
  }).subscribe('start fueling', function (fuelee) {
    if (fuelee.isCar) {
      FuelGauge.show(fuelee);
    }
  }).subscribe('stop fueling', function (fuelee) {
    FuelGauge.hide();
  });

  // use items on right click
  $("#canvas-mask .inventory .inventory-item").live('mousedown', function (e) {
    if (e.button == 2) { // right click
      var item = $(this).data('item');
      if (item.use) {
        item.use();
      } else if (item instanceof Firearm && item.ammoType) {
        // eject ammo from firearms on right click
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
  Game.addSprite(Framerate);

  // so the light can blink
  Game.addSprite(CheckEngineLight);
});
