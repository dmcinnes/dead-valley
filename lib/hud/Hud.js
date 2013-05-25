// Place where we handle all the HUD interaction details
define(['Game',
        'hud/InventoryDisplay',
        'hud/DudeHandsInventoryDisplay',
        'hud/LifeMeter',
        'hud/LoadingScreen',
        'hud/MainScreen',
        'hud/GameOver',
        'hud/StatsDisplay',
        'hud/Framerate',
        'hud/Time',
        'hud/TimeRemaining',
        'hud/Distance',
        'hud/FuelGauge',
        'hud/Tip',
        'hud/CheckEngineLight',
        'hud/LowFuelLight',
        'Firearm'],

       function (Game,
                 InventoryDisplay,
                 DudeHandsInventoryDisplay,
                 LifeMeter,
                 LoadingScreen,
                 MainScreen,
                 GameOver,
                 StatsDisplay,
                 Framerate,
                 Time,
                 TimeRemaining,
                 Distance,
                 FuelGauge,
                 Tip,
                 CheckEngineLight,
                 LowFuelLight,
                 Firearm) {

  var dudeInventory, dudeHands;
  var inventoryShown = false;
  var $dudeInventoryDiv = $('#dude-inventory');
  var $otherInventoryDiv = $('#other-inventory');
  var otherInventory = null;
  var otherInventoryDisplay = null;
  var change = false;

  var hudStatus = {
    fuelGauge:      false,
    dudeInventory:  false,
    otherInventory: false
  };

  var hudElements = {
    fuelGauge:      FuelGauge,
    dudeInventory:  $dudeInventoryDiv,
    otherInventory: otherInventoryDisplay
  };

  // run once per frame
  var updateHud = function () {

    if (change) {

      if (!otherInventory && otherInventoryDisplay) {
        removeOtherInventoryDisplay();
      }

      if (otherInventory &&
         (!otherInventoryDisplay ||
          otherInventory !== otherInventoryDisplay.inventory)) {
        updateOtherInventoryDisplay();
      }

      _.each(hudStatus, function (status, hud) {
        var element = hudElements[hud];
        if (element) {

          // if element has an active method use that
          // otherwise, inventory must be toggled on and the hud must have
          // its status set to true.
          status = (element.active && element.active(inventoryShown)) || inventoryShown && status;

          if (element.css) {
            if (status) {
              element.css('visibility', 'visible');
            } else {
              element.css('visibility', 'hidden');
            }
          } else {
            if (status) {
              element.show();
            } else {
              element.hide();
            }
          }
        }
      });

      change = false;
    }

  };

  // remove the current other inventory
  var removeOtherInventoryDisplay = function () {
    if (otherInventoryDisplay) {
      otherInventoryDisplay.clearEventHandlers();
      otherInventoryDisplay = null;
      hudElements.otherInventory = null;
      $otherInventoryDiv.empty();
    }
  };

  // update the other inventory to whatever is focused
  var updateOtherInventoryDisplay = function () {
    removeOtherInventoryDisplay();
    otherInventoryDisplay = new InventoryDisplay(otherInventory,
                                                 $otherInventoryDiv,
                                                 { doubleClickTarget:Game.dude.inventory });
    hudElements.otherInventory = otherInventoryDisplay;
  };

  // set up the dude's inventories and other handlers
  var dudeSetup = function (dude) {
    $dudeInventoryDiv.empty();
    dudeInventory = new InventoryDisplay(Game.dude.inventory,
                                         $dudeInventoryDiv,
                                         { doubleClickTarget: Game.dude.hands });
    dudeHands = DudeHandsInventoryDisplay($dudeInventoryDiv);

    // now that we have a dude, attach his handlers
    attachHandlers(dude, dudeHandlers);
  };

  var cleanUp = function () {
    // hide the HUD
    inventoryShown = false;
    otherInventory = null;
    // update right away
    change = true;
    updateHud();
  };

  var attachHandlers = function (eventMachine, handlers) {
    _.each(handlers, function (handler, key) {
      eventMachine.subscribe(key, function () {
        handler.apply(this, arguments);
        change = true;
      });
    });
  };

  var gameHandlers = {
    'toggle inventory': function () {
      inventoryShown = !inventoryShown;
      hudStatus.dudeInventory = inventoryShown;
    },
    'hide inventory': function () {
      inventoryShown = false;
      hudStatus.dudeInventory = false;
    },
    'start fueling': function (fuelee) {
      if (fuelee.isCar) {
        hudStatus.fuelGauge = true;
      }
    },
    'stop fueling': function (fuelee) {
      hudStatus.fuelGauge = false;
    },
    'new dude':   dudeSetup,
    'game over':  cleanUp,
    'game start': cleanUp
  };

  var dudeHandlers = {
    'entered car': function (car) {
      otherInventory = car.inventory;
      hudStatus.otherInventory = true;
      hudStatus.fuelGauge      = true;
    },

    'left car': function (car) {
      otherInventory = null;
      hudStatus.otherInventory = false;
      hudStatus.fuelGauge      = false;
    },

    'entered building': function (building) {
      otherInventory = building.inventory;
      hudStatus.otherInventory = true;
    },

    'left building': function (building) {
      otherInventory = null;
      hudStatus.otherInventory = false;
    },

    'started touching': function (sprite) {
      // show the car's inventory when we touch it
      if (sprite.isCar && sprite.inventory) {
        otherInventory = sprite.inventory;
        hudStatus.otherInventory = true;
      }
    },

    'stopped touching': function (sprite) {
      if (sprite.isCar) {
        otherInventory = null;
        hudStatus.otherInventory = false;
      }
    }
  };

  // use items on right click
  $("#container").on('mousedown', '.inventory-item', function (e) {
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

  // Time HUDs
  Game.addSprite(Time);
  Game.addSprite(TimeRemaining);

  // distance HUD
  Game.addSprite(Distance);

  // so the lights can blink
  Game.addSprite(CheckEngineLight);
  Game.addSprite(LowFuelLight);
  
  // attach all the handlers to game events we care about
  attachHandlers(Game.events, gameHandlers);

  // check for HUD updates after every frame
  Game.events.subscribe('end frame', updateHud);

  return {
    status: hudStatus
  };
});
