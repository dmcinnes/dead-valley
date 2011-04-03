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
    addSprites: function (spriteHash, offset) {
      var self = this;
      _(spriteHash).each(function (coords, key) {
        // TODO these could be cars too
        require(['objects/'+key], function (NewSprite) {
          for (var i = 0; i < coords.length; i += 2) {
            var sprite = new NewSprite();
            sprite.pos.x = coords[i]   + offset.x;
            sprite.pos.y = coords[i+1] + offset.y;
            self.sprites.push(sprite);
          }
        });
      });
    }
  };

  return game;
});
