require(
  ["Game",
   "GameTime",
   "Progress",
   "World",
   "Map",
   "Controls",
   "MainLoop",
   "Sprite",
   "Dude",
   "Sky",
   "hud/Hud",
   "Mouse",
   "sprites/GasPump", // to get in before 'new dude' event is fired
   "fx/Nuke",
   "fx/Audio",
   "fx/Hint",
   "Introduction",
   "Cheat"],

  function (Game,
            GameTime,
            Progress,
            World,
            Map) {

  Game.map = new Map(128, 128);

  Progress.start(function () {
    Game.events.fireEvent("everything loaded");
  });

  // save the sprites before we leave
  $(window).unload(function () {
    // don't save if the world has been cleared
    // -- cleared the world for a reason
    if (World.usedSpace()) {
      World.saveDude(Game.dude);
      World.saveTime(GameTime.elapsedTime());
      Game.map.save();
    }
  });

});
