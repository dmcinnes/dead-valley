require(
  ["game",
   "gridnode",
   "map",
   "mainloop",
   "sprite",
   "objects/Honda",
   "dude",
   "Zombie",
   "Sky",
   "framerate",
   "objects/Barrel"],

  function (game, GridNode, Map, mainloop, Sprite, Honda, Dude, Zombie, Sky, framerate, Barrel) {

    // TODO clean this up so main isn't so cluttered
    require.ready(function () {

      game.sprites.push(Sky);

      // want to start in the center of the right vertical road
      var startX = 50 + 96 * game.gridSize;
      var startY = 64 * game.gridSize;

      var dude = new Dude();
      dude.pos.x = startX;
      dude.pos.y = startY;
      game.dude = dude;
      game.sprites.push(dude);

      var zombie = new Zombie();
      zombie.pos.x = startX + 200;
      zombie.pos.y = startY;
      game.sprites.push(zombie);

      zombie = new Zombie();
      zombie.pos.x = startX + 200;
      zombie.pos.y = 1000;
      game.sprites.push(zombie);

      zombie = new Zombie();
      zombie.pos.x = startX + 300;
      zombie.pos.y = 1000;
      game.sprites.push(zombie);

      game.sprites.push(framerate);

      // toggle show framerate
      game.controls.registerKeyDownHandler('f', function () {
        if (framerate.isShowing()) {
          framerate.hide();
        } else {
          framerate.show();
        }
      });

      var parseNode = $('#pause');
      // toggle pause
      game.controls.registerKeyDownHandler('p', function () {
        if (mainloop.isPaused()) {
          mainloop.play();
          parseNode.removeClass('active');
        } else {
          mainloop.pause();
          parseNode.addClass('active');
        }
      });

      // transition sky states
      game.controls.registerKeyDownHandler('n', function () {
        Sky.gotoNextState();
      });

      // set up the map
      game.map = new Map(128, 128, startX, startY, function () {
        // only run the main loop after the map is loaded
        mainloop.play();
      });

    });

});
