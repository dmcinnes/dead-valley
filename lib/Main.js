require(
  ["Game",
   "Support",
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
            Support,
            GameTime,
            Progress,
            World,
            Map) {

  if (Support.allGreen) {

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

  } else {
    // browser doesn't support what we need
    var $loading = $('#loading-screen');

    $loading.html("I'm sorry, your browser does not support a feature that this game needs to run.<br/>Try Chrome or Safari.");
    var $list = $('<ul>');
    _.each(Support.missing, function (feature) {
      $list.append($('<li>').text(feature));
    });
    $loading.append($('<p>').text('Missing Features:'));
    $loading.append($list);
  }

});
