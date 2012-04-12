define(['Game', 'Vector', 'hud/Hud', 'fx/Hint'], function (Game, Vector, Hud, Hint) {

  var skipped = false;

  var Hints = {
    move: {
      windowPos: new Vector(416, 115),
      text:      "Use the Arrow keys or<br>WASD to move around.",
      tail:      false
    },
    skip: {
      windowPos:    new Vector(60, 550),
      text:         "Disable Hints",
      tail:         false,
      id:           'skip-hints',
      fadeDuration: 0.5,
      duration:     10
    },
    drive: {
      windowPos: new Vector(416, 115),
      text:      "Use the Arrow keys or<br>WASD to drive.",
      tail:      false
    },
    buildingInventory: {
      windowPos: new Vector(106, 185),
      text:      "This is the Building's Inventory.",
      tail:      'bottom'
    },
    showInventory: {
      windowPos: new Vector(716, 105),
      text:      "Press I to show your Inventory.",
      tail:      false
    },
    closeInventory: {
      windowPos: new Vector(716, 245),
      text:      "Press I again to close your Inventory.",
      tail:      false
    },
    dragPistol: {
      windowPos: new Vector(776, 165),
      text:      "Drag the pistol to one of<br>your hands to equip it.",
      tail:      'top',
      tailSide:  'right'
    },
    enterPickup: {
      pos:      new Vector(1279, 2055),
      text:     "Press E to Enter!",
      tail:     'top',
      throb:    true
    },
    enterHouse: {
      pos:      new Vector(1185, 1990),
      text:     "Press E to Enter!",
      tail:     'bottom',
      throb:    true
    },
    leaveHouse: {
      windowPos: new Vector(116, 115),
      text:      "Press E again to leave the house.",
      tail:      false
    },
    aimPistol: {
      windowPos: new Vector(416, 115),
      text:      "Use the mouse to aim and the<br>left mouse button to fire.",
      tail:      false
    },
    showCarInventory: {
      windowPos: new Vector(646, 115),
      text:      "Bring up the car's inventory by pressing I.",
      tail:      false
    },
    truckInventory: {
      windowPos: new Vector(101, 230),
      text:      "This is the Truck's Inventory.",
      tail:      'bottom'
    },
    fuelGauge: {
      windowPos: new Vector(91, 95),
      text:      "This is the Truck's Fuel Gauge.",
      tail:      'top'
    }
  };

  var showHint = function (name, callback) {
    if (!skipped) {
      return Hint.create(_.extend(Hints[name], {callback:callback}));
    }
  };

  var glockIntro = function (item) {
    if (item.clazz === 'Glock19') {
      Game.dude.hands.unsubscribe('itemAdded', glockIntro);
      Hint.dismissAll();
      showHint('closeInventory');
      Game.events.once('toggle inventory', function () {
        Hint.dismissAll();
        if (Game.dude.inside) {
          showHint('leaveHouse');
        }
      });
    }
  };

  var carsIntro = function (car) {
    if (car.hasFuel()) { // it's the truck
      Game.events.unsubscribe('enter car', carsIntro);
      Hint.dismissAll();
      showHint('drive');
      window.setTimeout(function () {
        if (!Hud.status.dudeInventory) {
          showHint('showCarInventory');

          Game.events.once('toggle inventory', function () {
            if (Game.dude.driving) {
              Hint.dismissAll();
              showHint('truckInventory');
              showHint('fuelGauge');
              Game.events.once('toggle inventory', function () {
                Hint.dismissAll();
              });
            }
          }, 1500);
        } else {
          showHint('truckInventory');
          showHint('fuelGauge');
        }
      }, 1000);
    }
  };

  Game.events.once('new game', function () {

    // no hints on saved games
    if (Game.hasSavedGame()) {
      return;
    }

    showHint('move', function () {
      if (!Game.dude.inside) {
        showHint('enterHouse');
      }
    });

    window.setTimeout(function () {
      showHint('skip').node.click(function (e) {
        e.preventDefault();
        skipped = true;
        Hint.dismissAll(0.3);
      });
    }, 2000);

    Game.events.once('enter building', function () {
      Hint.dismissAll();

      showHint('buildingInventory');

      if (!Hud.status.dudeInventory) {
        window.setTimeout(function () {
          showHint('showInventory');
        }, 1500);

        Game.events.once('toggle inventory', function () {
          Hint.dismissAll();
          showHint('dragPistol');
        }, 1500);
      } else {
        showHint('dragPistol');
      }

      Game.dude.hands.subscribe('itemAdded', glockIntro);
    });

    Game.events.once('leave building', function () {
      Game.dude.hands.unsubscribe('itemAdded', glockIntro);
      
      if (Game.dude.hands.hasAimableItem()) {
        Hint.dismissAll();
        showHint('aimPistol');
      }

      window.setTimeout(function () {
        showHint('enterPickup');
      }, 10000);
    });

    Game.events.subscribe('enter car', carsIntro);

  });

});
