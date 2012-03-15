define(['Game', 'Vector', 'hud/Hud', 'fx/Hint'], function (Game, Vector, Hud, Hint) {

  var Hints = {
    move: {
      windowPos: new Vector(450, 140),
      text:      'Use the Arrow keys or<br>WASD to move around.',
      duration:  6,
      tail:      false
    },
    drive: {
      windowPos: new Vector(450, 140),
      text:      "Use the Arrow keys or<br>WASD to drive.",
      duration:  6,
      tail:      false
    },
    buildingInventory: {
      windowPos: new Vector(140, 210),
      text:      "This is the Building's Inventory.",
      tail:      'bottom',
      duration:  6
    },
    showInventory: {
      windowPos: new Vector(750, 140),
      text:      "Press I to show your Inventory.",
      tail:      false,
      duration:  6
    },
    closeInventory: {
      windowPos: new Vector(750, 280),
      text:      "Press I again to close your Inventory.",
      tail:      false,
      duration:  6
    },
    dragPistol: {
      windowPos: new Vector(810, 190),
      text:      "Drag the pistol to one of<br>your hands to equip it.",
      tail:      'top',
      tailSide:  'right',
      duration:  6
    },
    enterPickup: {
      pos:      new Vector(1279, 2055),
      text:     "Press E to Enter!",
      duration: 6,
      tail:     'top',
      throb:    true
    },
    enterHouse: {
      pos:      new Vector(1185, 1990),
      text:     "Press E to Enter!",
      duration: 6,
      tail:     'bottom',
      throb:    true
    },
    leaveHouse: {
      windowPos: new Vector(150, 140),
      text:      "Press E again to leave the house.",
      tail:      false,
      duration:  6
    },
    aimPistol: {
      windowPos: new Vector(450, 140),
      text:      "Use the mouse to aim and the<br>left mouse button to fire.",
      tail:      false,
      duration:  6
    },
    showCarInventory: {
      windowPos: new Vector(680, 140),
      text:      "Bring up your inventory again by pressing I.",
      tail:      false,
      duration:  6
    },
    truckInventory: {
      windowPos: new Vector(135, 255),
      text:      "This is the Truck's Inventory.",
      tail:      'bottom',
      duration:  6
    },
    fuelGauge: {
      windowPos: new Vector(125, 120),
      text:      "This is the Truck's Fuel Gauge.",
      tail:      'top',
      duration:  6
    }
  };

  var showHint = function (name, callback) {
    Hint.create(_.extend(Hints[name], {callback:callback}));
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
            Hint.dismissAll();
            showHint('truckInventory');
            showHint('fuelGauge');
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
