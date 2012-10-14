require(['Game', 'GameTime', 'World', 'Reporter'], function (Game, GameTime, World, Reporter) {

  var saveState = function () {
    try {
      World.saveStats(Reporter.counters());
      // don't save if the game isn't running
      // or if the world has been cleared
      // -- cleared the world for a reason
      if (!Game.isOver && World.usedSpace()) {
        World.saveDude(Game.dude);
        World.saveTime(GameTime.elapsedTime());
        World.saveTimeLimit(GameTime.targetTime());
        Game.map.save();
      }
    } catch (e) {
      console.log("there was a problem saving: " + e.message, e);
    }
  };

  // save game state before we leave
  $(window).unload(saveState);

  // save state every minute
  window.setInterval(saveState, 60 * 1000);

});
