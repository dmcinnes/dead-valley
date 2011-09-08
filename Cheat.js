define(['game'], function (game) {

  var killHandler = function (e, sprite) {
    if (sprite.takeDamage) {
      sprite.takeDamage(999);
    } else {
      sprite.die();
    }
    // unsubscribe when we're done
    game.events.unsubscribe('click', killHandler);
  };

  window.Cheat = {
    spawn: function (Thing, count) {
      count = count || 1;

      require(['sprites/'+Thing], function (Clazz) {

        // set up a click handler
        $('#click-overlay').one('click', function (e) {
          var coords = game.map.worldCoordinatesFromWindow(e.pageX, e.pageY);
          for (var i = 0; i < count; i++) {
            var sprite = new Clazz();
            sprite.pos.set(coords);
            game.addSprite(sprite);
          }
          return false; // stop propagation
        });

      });
    },

    kill: function () {
      game.events.subscribe('click', killHandler);
    },

    give: function (Thing) {
      require(['inventory/'+Thing], function (Clazz) {
        var thing = new Clazz();
        if (thing.maxCount) {
          thing.setCount(thing.maxCount);
        }
        game.dude.inventory.stuffItemIn(thing);
      });
    }
  };

});
