require(
  ["Game",
   "Controls",
   "GridNode",
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
   "Cheat"],

  function (Game,
            Controls,
            GridNode,
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
            Cheat) {

  Game.map = new Map(128, 128);

  var loadEvents = ["map loaded", "audio loaded"];
  var eventCount = 1;

  _.each(loadEvents, function (event) {
    Game.events.subscribe(event, function () {
      eventCount++;
      if (eventCount === loadEvents.length) {
        Game.events.fireEvent("everything loaded");
      }
    });
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
