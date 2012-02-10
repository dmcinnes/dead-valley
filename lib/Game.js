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
        'GameTime',
        'Keyboard',
        'Collidable',
        'EventMachine',
        'SpriteMarshal',
        'Vector',
        'Reporter',
        'World'],
        function (AssetManager,
                  GameTime,
                  Keyboard,
                  Collidable,
                  EventMachine,
                  SpriteMarshal,
                  Vector,
                  Reporter,
                  World) {

  var spriteID = 0;

  var waitingSprites = 0;

  var speculativeCollisionIterations = 1;

  var gameStates = {
    start: function (delta) {
      Game.isOver = false;
      GameTime.setTargetTime(Game.targetTime);
      currentGameState = gameStates.running;
      Game.events.fireEvent('game start');
    },
    running: function (delta) {
      GameTime.tick(delta);
      var distance = Game.dude.pos.magnitude() / 15840;
      if (distance > Game.targetMiles) {
        currentGameState = gameStates.won;
      } else if (Game.dude.health <= 0) {
        currentGameState = gameStates.died;
      }
    },
    won: function (delta) {
      Game.isOver = true;
      Game.events.fireEvent('game over');
      currentGameState = gameStates.stopped;
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
    assetManager:  new AssetManager('./assets/'),
    keyboard:      Keyboard,
    reporter:      Reporter,
    targetMiles:   20,
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

    startPosition: new Vector(1714, 1822),

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

        // pre move
        for (i = 0; i < spriteCount; i++) {
          sprite = this.sprites[i];

          if (sprite.visible && sprite.preMove) {
            sprite.preMove(delta);
          }
        }

        for (var k = 0; k < speculativeCollisionIterations; k++) {

          // speculative move
          for (i = 0; i < spriteCount; i++) {
            sprite = this.sprites[i];
            if (sprite.visible && sprite.collidable && sprite.collideRange) {
              // use the current delta
              sprite.speculativeMove(delta);
            }
          }

          Collidable.clearCurrentCollisionList();

          // generate contact list
          var contactList = [];
          for (i = 0; i < spriteCount; i++) {
            sprite = this.sprites[i];
            if (sprite.visible && sprite.collidable && sprite.collideRange) {
              sprite.checkForCollisionsWithNearbyObjects(contactList);
            }
          }

          // contacts resolution
          var contact;
          var contactListLength = contactList.length;
          for (j = 0; j < 3; j++) {
            for (i = 0; i < contactListLength; i++) {
              contact = contactList[i];
              if ( !(contact.we.isRigidBody || contact.they.isRigidBody) ) {
                Collidable.speculativeContactRectifier(contact, delta);
              }
            }
          }

          // restore position
          for (i = 0; i < spriteCount; i++) {
            sprite = this.sprites[i];

            if (sprite.visible && sprite.collidable) {
              sprite.restorePreSpeculativePosition();
            }
          }
        } // end of speculativeCollisionIterations loop
      
        // integrate
        for (i = 0; i < spriteCount; i++) {
          sprite = this.sprites[i];

          if (sprite.visible) {
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
          if (contact.we.isRigidBody || contact.they.isRigidBody) {
            Collidable.rigidBodyContactRectifier(contact);

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

          if (sprite.updateCollideState) {
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
      this.addSpriteID(sprite);
      this.sprites.push(sprite);
      if (sprite.spawned) {
	sprite.spawned();
      }
    },

    addSpriteID: function (sprite) {
      sprite.id = spriteID++;
    },

    // number of sprites we're waiting to load
    waitingSpriteCount: function () {
      return waitingSprites;
    },

    newDude: function (dude) {
      if (this.dude) {
	this.dude.die();
      }
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

    newGame: function () {
      this.events.fireEvent('stop game');

      currentGameState = gameStates.newGame;

      _.each(Game.sprites, function (sprite) {
        if (sprite.die) {
          sprite.die();
        }
      });

      Game.map.freeAllNodes();
      Game.map.setStartPosition(Game.startPosition.x, Game.startPosition.y);
      Game.map.loadStartMapTiles('EW_burbs');

      require(['Dude'], function (Dude) {
        var dude = new Dude();
        dude.pos.set(Game.startPosition);
        Game.newDude(dude);
      });
    },

    loadGame: function () {
      currentGameState = gameStates.start;
    }
  };

  var loadEvents = ["map loaded", "audio loaded"];
  var eventCount = 0;

  _.each(loadEvents, function (event) {
    Game.events.subscribe(event, function () {
      eventCount++;
      if (eventCount >= loadEvents.length) {
        Game.events.fireEvent("everything loaded");
      }
    });
  });

  return Game;
});
