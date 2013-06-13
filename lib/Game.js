//
// Couple notes on our setup
//
// 1 pixel  == 4 inches
// 3 pixels == 1 foot
// 1 tile   == 60 pixels == 20 feet
// 1 mile   == 63360 inches == 15840 pixels
// 60  miles / hour == 264 pixels / second
// 100 miles / hour == 440 pixels / second

define(['AssetManager',
        'Console',
        'GameTime',
        'Keyboard',
        'Collidable',
        'EventMachine',
        'SpriteMarshal',
        'Vector',
        'World'],
        function (AssetManager,
                  Console,
                  GameTime,
                  Keyboard,
                  Collidable,
                  EventMachine,
                  SpriteMarshal,
                  Vector,
                  World) {

  var waitingSprites = 0;

  var speculativeResolutionIterations = 3;

  var gameStates = {
    start: function (delta) {
      Game.isOver = false;
      currentGameState = gameStates.running;
    },
    running: function (delta) {
      GameTime.tick(delta);
      var distance = Game.dude.distanceFromOrigin();
      if (distance >= Game.targetMiles) {
        currentGameState = gameStates.won;
      } else if (Game.dude.health <= 0) {
        currentGameState = gameStates.died;
      }
    },
    won: function (delta) {
      World.clear();
      Game.isOver = true;
      Game.events.fireEvent('game over');
      currentGameState = gameStates.stopped;
      this.cleanupCurrentDude();
    },
    died: function (delta) {
      World.clear();
      Game.isOver = true;
      Game.events.fireEvent('game over');
      currentGameState = gameStates.stopped;
    },
    newGame: function (delta) {
      GameTime.setTime(0);
      currentGameState = gameStates.start;
    },
    stopped: function (delta) {
    }
  };

  var currentGameState = gameStates.start;

  GameTime.subscribe("target time passed", function () {
    currentGameState = gameStates.died;
  });

  var Game = {
    version:       (window.DV && window.DV.version),
    isOver:        true,
    assetManager:  new AssetManager('./assets/'),
    keyboard:      Keyboard,
    targetMiles:   150,
    targetTime:    GameTime.secondsInADay * 3 + 5,
    gridSize:      60,
    tileRowSize:   9,  // should be set by asset manager
                       // this is the number of tiles in row
                       // of the tile image
    GameWidth:     $('#canvas-mask').width(),
    GameHeight:    $('#canvas-mask').height(),
    map:           null,
    dude:          null,
    sprites:       [],
    objects:       [],
    events:        EventMachine(),
    skyContext:    $('#sky-canvas')[0].getContext('2d'),
    threeDee:      true, // 3D acceleration

    startPosition: Vector.create(1282, 1994, true),

    runMap: function (delta) {
      if (this.map) this.map.run(delta);
    },

    renderMap: function (delta) {
      if (this.map) this.map.render(delta);
    },

    runSprites: function (delta) {
      if (this.map) {
        var i, j, k, sprite;

        var spriteCount = this.sprites.length;

        for (i = 0; i < spriteCount; i++) {
          sprite = this.sprites[i];

          // pre move
          if (sprite.visible && sprite.preMove) {
            sprite.preMove(delta);
          }

          // speculative move
          if (sprite.shouldCheckForCollision &&
              sprite.shouldCheckForCollisions()) {
            // use the current delta
            sprite.speculativeMove(delta);
          }
        }

        Collidable.clearCurrentCollisionList();

        // generate contact list
        var contactList = [];
        for (i = 0; i < spriteCount; i++) {
          sprite = this.sprites[i];
          if (sprite.shouldCheckForCollisions &&
              sprite.shouldCheckForCollisions()) {
            sprite.checkForCollisionsWithNearbyObjects(contactList);
          }
        }

        // contacts resolution
        var contact;
        var contactListLength = contactList.length;
        for (j = 0; j < speculativeResolutionIterations; j++) {
          for (i = 0; i < contactListLength; i++) {
            contact = contactList[i];
            if (!contact.we.touchOnly && !contact.they.touchOnly &&
               !Collidable.runRigidBodyRectifier(contact)) {
              Collidable.speculativeContactRectifier(contact, delta);
            }
          }
        }
      
        // integrate
        for (i = 0; i < spriteCount; i++) {
          sprite = this.sprites[i];

          if (sprite.visible) {
            // restore position from speculative move
            if (sprite.collidable) {
              sprite.restorePreSpeculativePosition();
            }

            if (sprite.integrate && !sprite.stationary) {
              sprite.integrate(delta);
            } else if (sprite.updateGrid) {
              sprite.updateGrid();
            }
          }
        }

        Collidable.clearCurrentCollisionList();

        // rigid body collisions
        for (i = 0; i < contactListLength; i++) {
          contact = contactList[i];
          if (!contact.we.touchOnly && !contact.they.touchOnly &&
              Collidable.runRigidBodyRectifier(contact)) {
            Collidable.rigidBodyContactRectifier(contact);

            // if rigidbody is 'stationary' the speculative
            // contact rectifier will do odd things because it
            // makes it have a mass of infinity
            if (contact.we.isRigidBody) {
              contact.we.stationary = false;
            }
            if (contact.they.isRigidBody) {
              contact.they.stationary = false;
            }

            // retry and rectify this collision so we're not bouncy
            contact.we.speculativeMove(delta);
            contact.they.speculativeMove(delta);

            var newContact = contact.we.checkCollision(contact.they);
            if (newContact) {
              Collidable.speculativeContactRectifier(newContact, delta);
            }

            contact.we.restorePreSpeculativePosition();
            contact.they.restorePreSpeculativePosition();
          }

          // report all collisions
          Collidable.reportCollision(contact);
        }

        // post move
        for (i = 0; i < spriteCount; i++) {
          sprite = this.sprites[i];
          if (sprite.visible && sprite.postMove) {
            sprite.postMove(delta);
          }

          if (!sprite.fx && sprite.updateCollideState) {
            sprite.updateCollideState();
          }

          if (sprite.reap) {
            sprite.reap = false;
            this.sprites.splice(i, 1);
            i--;
            spriteCount--;
          }
        }

      }
    },

    runObjects: function (delta) {
      var objectCount = this.objects.length;
      for (var i = 0; i < objectCount; i++) {
        this.objects[i].tick(delta);
      }
    },

    renderSprites: function (delta) {
      if (this.map) {
        var spriteCount = this.sprites.length;
        for (var i = 0; i < spriteCount; i++) {
          var sprite = this.sprites[i];
          if (sprite.visible) {
            if (sprite.updateRenderState) {
              sprite.updateRenderState();
            }
            if (sprite.render && sprite.onScreen) {
              sprite.render(delta);
            }
          }
        }
      }
    },

    cleanupFrame: function () {
      Vector.freeAllocated();
    },

    addSpritesFromStrings: function (sprites, offset) {
      var self = this;

      _(sprites).each(function (spriteString) {

        waitingSprites++;

        SpriteMarshal.marshal(spriteString, function (sprite) {
          sprite.pos.translate(offset);
          self.addSprite(sprite);
          waitingSprites--;
          if (waitingSprites === 0) {
            self.events.fireEvent('waiting sprites loaded');
          }
        });
      });
    },

    addSprite: function (sprite) {
      this.sprites.push(sprite);
      if (sprite.spawned) {
        sprite.spawned();
      }
    },

    getSpriteByID: function (id) {
      return _.find(this.sprites, function (sprite) {
        return id === sprite.id;
      });
    },

    // number of sprites we're waiting to load
    waitingSpriteCount: function () {
      return waitingSprites;
    },

    newDude: function (dude) {
      this.dude = dude;

      this.addSprite(dude);

      this.events.fireEvent('new dude', dude);
    },

    registerObjectForDeltaUpdates: function (object) {
      this.objects.push(object);
    },
    
    runGameState: function (delta) {
      currentGameState.call(this, delta);
    },

    cleanupCurrentDude: function () {
      if (this.dude) {
        this.dude.die();
        this.dude = null;
      }
    },

    loadSavedGame: function () {
      var dudeState = World.getDude();

      if (!dudeState) {
        Console.error("tried to load non-existant saved game!");
        return;
      }

      this.cleanupCurrentDude();

      require(['Dude'], function (Dude) {
        // Call me The DUDE
        var dude = Dude.marshal(dudeState);
        Game.newDude(dude);

        // set up the map
        Game.map.setPosition(dude.pos.x, dude.pos.y);

        // set the time
        GameTime.setTime(World.getTime());
        GameTime.setTargetTime(World.getTimeLimit());

        // start game only after these events have been fired
        Game.events.waitForEvents('waiting sprites loaded',
                                  'saved map loaded',
                                  function () {
                                    Game.events.fireEvent('game start');
                                  });

        Game.map.loadAllMapTiles({}, function () {
          Game.events.fireEvent('saved map loaded');
        });
      });
    },

    newGame: function (time) {
      this.events.fireEvent('stop game');
      this.events.fireEvent('new game');

      World.clear();

      this.cleanupCurrentDude();

      currentGameState = gameStates.newGame;

      GameTime.setTargetTime(time ? Game.targetTime : null);

      for (var i = 0; i < Game.sprites.length; i++) {
        var sprite = Game.sprites[i];
        if (sprite.die) {
          sprite.die();
          Game.sprites.splice(i, 1);
          i--;
        }
      }

      Game.map.freeAllNodes();
      Game.map.clearSectionCounts();
      Game.map.setPosition(Game.startPosition.x, Game.startPosition.y);
      Game.map.loadAllMapTiles({nw:'NS_start'}, function () {

        require(['Dude'], function (Dude) {
          var dude = new Dude();
          dude.pos.set(Game.startPosition);
          Game.newDude(dude);

          Game.events.fireEvent('game start');
        });

      });
    },

    continueGame: function () {
      var pos = Game.dude.pos;

      this.cleanupCurrentDude();

      require(['Dude'], function (Dude) {
        var dude = new Dude();
        dude.pos.set(pos);
        dude.makeInvulnerable();
        Game.newDude(dude);

        Game.isOver = false;
        currentGameState = gameStates.running;

        Game.events.fireEvent('continue game');
      });
    },

    hasSavedGame: function () {
      var dude = World.getDude();
      return dude && JSON.parse(dude).health > 0;
    }
  };

  return Game;
});
