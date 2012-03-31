define(['Game', 'GameTime'], function (Game, GameTime) {

  var killHandler = function (e, sprite) {
    if (sprite.takeDamage) {
      sprite.takeDamage(999);
    } else {
      sprite.die();
    }
    // unsubscribe when we're done
    Game.events.unsubscribe('click', killHandler);
  };

  var fillit = function (e, sprite) {
    if (sprite.receiveFuel) {
      sprite.startReceivingFuel();
      sprite.receiveFuel(100);
      sprite.stopReceivingFuel();
    }
    // unsubscribe when we're done
    Game.events.unsubscribe('click', fillit);
  }

  window.Cheat = {
    spawn: function (Thing, count) {
      count = count || 1;

      require(['sprites/'+Thing], function (Clazz) {

        // set up a click handler
        $('#canvas-mask').one('click', function (e) {
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
    },

    fillErUp: function () {
      Game.events.subscribe('click', fillit);
    },

    sprites: function () {
      var counts = {}; 
      var total = 0;
      _.each(Game.sprites, function (sprite) {
        var clazz = sprite.clazz;
        if (clazz) {
          total++;
          if (!counts[clazz]) {
            counts[clazz] = 0;
          }
          counts[clazz]++;
        }
      });

      _.each(_.keys(counts).sort(), function (key) {
        console.log(counts[key], key + 's');
      });

      console.log('--------------');
      console.log('Total:', total);
    },

    nuke: function () {
      GameTime.setTime(GameTime.targetTime());
    },

    setTime: function (time) {
      GameTime.setTime(GameTime.secondsInAnHour * time);
    }
  };

});
