define(['Game', 'Vector', 'hud/Hud', 'fx/Hint'], function (Game, Vector, Hud, Hint) {

  var Hints = {
    move: {
      windowPos: new Vector(450, 140),
      text:      "Use the Arrow keys or<br>WASD to move around.",
      duration:  6,
      tail:      false,
    },
    buildingInventory: {
      windowPos: new Vector(140, 210),
      text:      "This is the Building's Inventory.",
      tail:      'bottom',
      duration:  6
    },
    toggleInventory: {
      windowPos: new Vector(750, 140),
      text:      "Press I to toggle your Inventory.",
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
    glockIntro1: {
      windowPos: new Vector(810, 190),
      text:      "The number represents the<br>firearm's ammo count.",
      duration:  6
    },
    glockIntro2: {
      windowPos: new Vector(810, 230),
      text:      "Reload by dropping ammo on it.",
      duration:  6
    },
    glockIntro3: {
      windowPos: new Vector(810, 270),
      text:      "You can also reload from inventory<br>by pressing R.",
      duration:  6
    },
  };

  var showHint = function (name) {
    Hint.create(Hints[name]);
  };

  var glockIntro = function (item) {
    if (item.clazz === 'Glock19') {
      Game.dude.hands.unsubscribe('itemAdded', glockIntro);
      // Hint.dismissAll();
      Hint.create('glockIntro1');
      Hint.create('glockIntro2');
      Hint.create('glockIntro3');
    }
  };

  Game.events.once('new game', function () {

    showHint('move');

    Game.events.once('enter building', function () {
      Hint.dismissAll();

      showHint('buildingInventory');

      if (!Hud.status.dudeInventory) {
        window.setTimeout(function () {
          showHint('toggleInventory');
        }, 1500);

        Game.events.once('toggle inventory', function () {
          Hint.dismissAll();
          showHint('dragPistol');
        }, 1500);
      } else {
        showHint('dragPistol');
      }

      // Game.dude.hands.subscribe('itemAdded', glockIntro);
    });

    Game.events.once('leave building', function () {
      Game.dude.hands.unsubscribe('itemAdded', glockIntro);
    });

    window.setTimeout(function () {
      showHint('enterHouse');
      showHint('enterPickup');
    }, 3000);

  });

});
