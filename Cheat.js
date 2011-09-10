define(['Game'], function (Game) {

  var killHandler = function (e, sprite) {
    if (sprite.takeDamage) {
      sprite.takeDamage(999);
    } else {
      sprite.die();
    }
    // unsubscribe when we're done
    Game.events.unsubscribe('click', killHandler);
  };

  window.Cheat = {
    spawn: function (Thing, count) {
      count = count || 1;

      require(['sprites/'+Thing], function (Clazz) {

        // set up a click handler
        $('#click-overlay').one('click', function (e) {
          var coords = Game.map.worldCoordinatesFromWindow(e.pageX, e.pageY);
          for (var i = 0; i < count; i++) {
            var sprite = new Clazz();
            sprite.pos.set(coords);
            Game.addSprite(sprite);
          }
          return false; // stop propagation
        });

      });
    },

    kill: function () {
      Game.events.subscribe('click', killHandler);
    },

    give: function (Thing) {
      require(['inventory/'+Thing], function (Clazz) {
        var thing = new Clazz();
        if (thing.maxCount) {
          thing.setCount(thing.maxCount);
        }
        Game.dude.inventory.stuffItemIn(thing);
      });
    }
  };

});
