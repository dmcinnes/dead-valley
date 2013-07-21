require(['Game', 'GameTime', 'World', 'Reporter', 'MainLoop', 'Console'],
        function (Game, GameTime, World, Reporter, MainLoop, Console) {

  var saveState = function () {
    try {
      if (!Game.isOver) {
        Console.log('saving...');
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
        Console.log('done.');
      }
    } catch (e) {
      console.log("there was a problem saving: " + e.message, e);
    }
  };

  // pause (which saves) and then ask if they're sure they want to leave
  window.onbeforeunload = function(){
    if (!Game.isOver && !MainLoop.isPaused()) {
      Game.events.fireEvent('esc');
      return 'Are you sure you want to exit the game?\nYour game has been saved so you can always resume later.';
    }
  };

  // save when paused
  Game.events.subscribe('pause', saveState);

  // save state every minute if we're not paused
  window.setInterval(function () {
    if (!MainLoop.isPaused()) {
      saveState();
    }
  }, 60 * 1000);

});
