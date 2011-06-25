require(
  ["game",
   "Controls",
   "gridnode",
   "map",
   "mainloop",
   "sprite",
   "dude",
   "Sky",
   "Inventory",
   "DudeHands",
   "hud/InventoryDisplay",
   "sprites/Honda",
   "sprites/Zombie",
   "sprites/Barrel",
   "inventory/Pistol",
   "inventory/AK_47",
   "hud/LifeMeter",
   "hud/Framerate",
   "hud/Pause",
   "World",
   "spriteMarshal"],

  function (game,
            Controls,
            GridNode,
            Map,
            mainloop,
            Sprite,
            Dude,
            Sky,
            Inventory,
            DudeHands,
            InventoryDisplay,
            Honda,
            Zombie,
            Barrel,
            Pistol,
            AK_47,
            LifeMeter,
            Framerate,
            Pause,
            World,
            spriteMarshal) {

    // TODO clean this up so main isn't so cluttered
    require.ready(function () {
      var dude, startX, startY;

      game.addSprite(Sky);

      var dudeState = World.getDude();

      if (dudeState) {
        var parsedDudeState = JSON.parse(dudeState);
        if (parsedDudeState.clazz === 'Dude') {
          dude = Dude.marshal(dudeState);
        } else {
          // Dude's driving something
          // name is of the vehicle's class
          dude = new Dude();
          dude.visible = false;
          spriteMarshal.marshal(dudeState, function (vehicle) {
            game.addSprite(vehicle);
            dude.enterCar(vehicle);
          });
        }
        startX = parsedDudeState.pos.x;
        startY = parsedDudeState.pos.y;
      } else {
        // want to start in the center of the right vertical road
        startX = 40 * game.gridSize;
        startY = 26 * game.gridSize;

        // add our starting players
        dude = new Dude();
        dude.pos.x = startX;
        dude.pos.y = startY;

        var zombie = new Zombie();
        zombie.pos.x = startX + 200;
        zombie.pos.y = startY;
        game.addSprite(zombie);

        zombie = new Zombie();
        zombie.pos.x = startX + 200;
        zombie.pos.y = 1000;
        game.addSprite(zombie);

        zombie = new Zombie();
        zombie.pos.x = startX + 300;
        zombie.pos.y = 1000;
        game.addSprite(zombie);
      }

      // Call me The DUDE
      game.newDude(dude);

      // framerate HUD
      game.addSprite(Framerate);

      // set up the map
      game.map = new Map(128, 128, startX, startY, function () {
        // only run the main loop after the map is loaded
        mainloop.play();
      });

      if (!dudeState) {
        game.map.loadStartMapTiles('gas-station-crossroads', 'intersection', 'intersection', 'intersection');
      } else {
        game.map.loadStartMapTiles();
      }

      // save the sprites before we leave
      $(window).unload(function () {
        if (World.usedSpace()) {
          game.map.save();
          World.saveDude(game.dude);
        }
      });

      // TODO put inventory creation somewhere else
      var inventory = new Inventory(9, 3);

      // give the dude a pistol!
      inventory.addItem(new Pistol(), 1, 1);
      // and why not, an AK
      inventory.addItem(new AK_47(), 5, 0);

      var dudeInventory = $('#dude-inventory');

      new InventoryDisplay(inventory, dudeInventory);

      new InventoryDisplay(DudeHands, dudeInventory, { id:'dude-hands' });

    });

});
