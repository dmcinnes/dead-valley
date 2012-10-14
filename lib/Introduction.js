define(['Game', 'GameTime', 'Vector', 'hud/Hud', 'fx/Hint'], function (Game, GameTime, Vector, Hud, Hint) {

  var skipped = false;

  var centerX = Game.GameWidth / 2;

  var $intro = $('#intro-screen');
  var $timeTrialText = $('#time-trial-text');


  var Hints = {
    move: {
      windowPos: Vector.create(centerX, 115, true),
      duration:  6,
      text:      "Use <b>&larr;&uarr;&darr;&rarr;</b> or<br>WASD to move around.",
      tail:      false
    },
    skip: {
      windowPos:    Vector.create(64, 550, true),
      text:         "Disable Hints",
      tail:         false,
      id:           'skip-hints',
      fadeDuration: 0.5,
      clickable:    true,
      duration:     10
    },
    drive: {
      windowPos: Vector.create(centerX, 115, true),
      duration:  6,
      text:      "Use <b>&larr;&uarr;&darr;&rarr;</b> or<br>WASD to drive.",
      tail:      false
    },
    buildingInventory: {
      windowPos: Vector.create(136, 185, true),
      duration:  6,
      text:      "This is the Building's Inventory.",
      tail:      'bottom'
    },
    showInventory: {
      windowPos: Vector.create(716, 105, true),
      duration:  6,
      text:      "Press I to show your Inventory.",
      tail:      false
    },
    closeInventory: {
      windowPos: Vector.create(756, 295, true),
      duration:  6,
      text:      "Press I again to close your Inventory.",
      tail:      false
    },
    dragPistol: {
      windowPos: Vector.create(786, 165, true),
      duration:  6,
      text:      "Drag the pistol to one of<br>your hands to equip it.",
      tail:      'top',
      tailSide:  'right'
    },
    enterPickup: {
      pos:      Vector.create(1658, 2057, true),
      duration:  6,
      text:     "Press E to Enter!",
      tail:     'top',
      throb:    true
    },
    ticketOuttaHere: {
      pos:      Vector.create(1658, 2025, true),
      duration:  6,
      text:     "This is your ticket<br>out of here.",
      tail:     'bottom',
      throb:    true
    },
    enterHouse: {
      pos:      Vector.create(1185, 1990, true),
      duration:  6,
      text:     "Press E to Enter!",
      tail:     'bottom',
      throb:    true
    },
    leaveHouse: {
      windowPos: Vector.create(166, 115, true),
      duration:  6,
      text:      "Press E again to leave the house.",
      tail:      false
    },
    aimPistol: {
      windowPos: Vector.create(centerX, 115, true),
      duration:  6,
      text:      "Use the mouse to aim and the<br>left mouse button to fire.",
      tail:      false
    },
    showCarInventory: {
      windowPos: Vector.create(700, 115, true),
      duration:  6,
      text:      "Bring up the truck's inventory by pressing I.",
      tail:      false
    },
    truckInventory: {
      windowPos: Vector.create(280, 182, true),
      duration:  6,
      text:      "This is the Truck's Inventory.",
      tail:      'bottom'
    },
    fuelGauge: {
      windowPos: Vector.create(123, 93, true),
      duration:  6,
      text:      "This is the Truck's Fuel Gauge.",
      tail:      'top',
      tailSide:  'left'
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
      }, 7000);
    }
  };

  var runHints = function () {
    showHint('move', function () {
      if (!Game.dude.inside) {
        showHint('enterHouse');
      }
    });

    window.setTimeout(function () {
      var hint = showHint('skip');
      if (hint && hint.node) {
        hint.node.click(function (e) {
          e.preventDefault();
          skipped = true;
          Hint.dismissAll(0.3);
        });
      }
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

      window.setTimeout(function () {
        showHint('ticketOuttaHere');
      }, 10500);
    });

    Game.events.subscribe('enter car', carsIntro);

  };

  var dismissIntro = function () {
    $intro.fadeOut(500);
    runHints();
  };

  Game.events.subscribe('game start', function () {
    // no hints/intro on saved games
    if (!Game.hasSavedGame()) {
      $intro.show();
      if (GameTime.targetTime()) {
        $timeTrialText.show();
      } else {
        $timeTrialText.hide();
      }
    }
  }).subscribe('select', function () {
    if ($intro.is(':visible')) {
      dismissIntro();
    }
  });

  $intro.click(dismissIntro);

});
