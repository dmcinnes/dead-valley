//
// Couple notes on our setup
//
// 1 pixel  == 4 inches
// 3 pixels == 1 foot
// 1 tile   == 60 pixels == 20 feet
// 1 mile   == 63360 inches == 15840 pixels
// 60  miles / hour == 264 pixels / second
// 100 miles / hour == 440 pixels / second

define(['assetmanager',
        'Keyboard',
        'collidable',
        'eventmachine',
        'spritemarshal'],
        function (AssetManager,
                  Keyboard,
                  collidable,
                  eventMachine,
                  spriteMarshal) {

  var canvas = $("#canvas");

  var i, sprite, spriteCount;

  var sprites = [];

  var sortSprites = function () {
    // sort by z value
    sprites.sort(function (a, b) {
      var diff = a.z - b.z;
      if (diff === 0 && a.z !== Number.MAX_VALUE) {
        diff = a.pos.y - b.pos.y;
      }
      return diff;
    });
  };

  return {
    assetManager:  new AssetManager('./assets/'),
    keyboard:      Keyboard,
    gridSize:      60,
    tileRowSize:   9,  // should be set by asset manager
                       // this is the number of tiles in row
                       // of the tile image
    canvasWidth:   canvas.width(),
    canvasHeight:  canvas.height(),
    spriteContext: canvas[0].getContext("2d"),
    skyContext:    $('#sky-canvas')[0].getContext("2d"),
    map:           null,
    dude:          null,
    sprites:       sprites,
    events:        eventMachine(),

    runMap: function (delta) {
      if (this.map) this.map.run(delta);
    },

    renderMap: function (delta) {
      if (this.map) this.map.render(delta);
    },

    runSprites: function (delta) {
      if (this.map) {

        // move
        spriteCount = this.sprites.length;
        for (i = 0; i < spriteCount; i++) {

          sprite = this.sprites[i];
          sprite.run(delta);

          if (sprite.reap) {
            sprite.reap = false;
            this.sprites.splice(i, 1);
            i--;
            spriteCount--;
          }
        }

        // collide!
        collidable.clearCurrentCollisionList();
        spriteCount = this.sprites.length;
        for (i = 0; i < spriteCount; i++) {
          sprite = this.sprites[i];
          if (sprite.collidable) {
            sprite.checkCollisionsAgainst(sprite.findCollisionCanidates());
          }
        }

      }
    },

    renderSprites: function (delta) {
      if (this.map) {
        sortSprites();
        spriteCount = this.sprites.length;
        for (i = 0; i < spriteCount; i++) {
          this.sprites[i].render(delta);
        }
      }
    },

    addSpritesFromStrings: function (sprites, offset) {
      var self = this;

      _(sprites).each(function (spriteString) {
        spriteMarshal.marshal(spriteString, function (sprite) {
          sprite.pos.translate(offset);
          self.sprites.push(sprite);
        });
      });
    },

    addSprite: function (sprite) {
      this.sprites.push(sprite);
    },

    newDude: function (dude) {
      if (this.dude) {
	this.dude.die();
      }
      this.dude = dude;

      this.addSprite(dude);

      this.events.fireEvent('new dude', dude);
    }
  };
});
