require(
  ["Game",
   "Progress",
   "Controls",
   "Map",
   "MainLoop",
   "Sprite",
   "Dude",
   "Sky",
   "hud/Hud",
   "World",
   "GameTime",
   "Mouse",
   "fx/Nuke",
   "fx/Audio",
   "Cheat"],

  function (Game,
            Progress,
            Controls,
            Map,
            MainLoop,
            Sprite,
            Dude,
            Sky,
            Hud,
            World,
            GameTime,
            Mouse,
            Nuke,
            Audio,
            Cheat) {

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
