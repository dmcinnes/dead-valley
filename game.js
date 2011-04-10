//
// Couple notes on our setup
//
// 1 pixel  == 4 inches
// 3 pixels == 1 foot
// 1 tile   == 60 pixels == 20 feet
// 1 mile   == 63360 inches == 15840 pixels
// 60  miles / hour == 264 pixels / second
// 100 miles / hour == 440 pixels / second

define(['assetmanager', 'controls', 'collidable'], function (AssetManager, controls, collidable) {
  var canvas = $("#canvas");

  var i, sprite, spriteCount;

  return {
    assetManager:  new AssetManager('./assets/'),
    controls:      controls,
    gridSize:      60,
    tileRowSize:   8,  // should be set by asset manager
                       // this is the number of tiles in row
                       // of the tile image
    canvasWidth:   canvas.width(),
    canvasHeight:  canvas.height(),
    spriteContext: canvas[0].getContext("2d"),
    skyContext:    $('#sky-canvas')[0].getContext("2d"),
    map:           null,
    sprites:       [],
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
        for (i = 0; i < this.sprites.length; i++) {
          this.sprites[i].render(delta);
        }
      }
    },
    addSprites: function (sprites, offset) {
      var self = this;
      _(sprites).each(function (spriteString) {
        var values, clazz, x, y, rot;
        // TODO perhaps we should have a spritemarshaler
        values = spriteString.split(',');
        clazz = values[0];
        x     = parseInt(values[1]) + offset.x;
        y     = parseInt(values[2]) + offset.y;
        rot   = parseInt(values[3]);
        // TODO these could be cars too
        require(['objects/'+clazz], function (NewSprite) {
          var sprite = new NewSprite();
          sprite.pos.x = x;
          sprite.pos.y = y;
          sprite.pos.rot = rot;
          sprite.visible = true;
          self.sprites.push(sprite);
        });
      });
    }
  };

  return game;
});
