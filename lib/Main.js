require(
  ["Game",
   "Support",
   "GameTime",
   "Progress",
   "World",
   "Reporter",
   "Map",
   "Controls",
   "MainLoop",
   "Sprite",
   "Dude",
   "Sky",
   "hud/Hud",
   "Mouse",
   "sprites/GasPump", // to get in before 'new dude' event is fired
   "inventory/RubberTubing", // ditto
   "fx/Nuke",
   "fx/Audio",
   "fx/Hint",
   "fx/Winning",
   "Introduction",
   "Cheat"],

  function (Game,
            Support,
            GameTime,
            Progress,
            World,
            Reporter,
            Map) {

  if (Support.allGreen) {

    Game.map = new Map(128, 128);

    Progress.start(function () {
      Game.events.fireEvent("everything loaded");
    });

    // save game state before we leave
    $(window).unload(function () {
      World.saveStats(Reporter.counters());
      // don't save if the world has been cleared
      // -- cleared the world for a reason
      if (World.usedSpace()) {
        Game.map.save();
        World.saveDude(Game.dude);
        World.saveTime(GameTime.elapsedTime());
        World.saveTimeLimit(GameTime.targetTime());
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

  if (!$.browser.webkit) {
    $("#moz-warn").show();
  }

});
