//
// Couple notes on our setup
//
// 1 pixel  == 4 inches
// 3 pixels == 1 foot
// 1 tile   == 60 pixels == 20 feet
// 1 mile   == 63360 inches == 15840 pixels
// 60  miles / hour == 264 pixels / second
// 100 miles / hour == 440 pixels / second

define(['assetmanager', 'controls'], function (AssetManager, controls) {
  var canvas = $("#canvas");

  return {
    assetManager:  new AssetManager(),
    controls:      controls,
    gridSize:      60,
    canvasWidth:   canvas.width(),
    canvasHeight:  canvas.height(),
    spriteContext: canvas[0].getContext("2d"),
    map:           null,
    sprites:       [],
    runMap: function (delta) {
      if (this.map) this.map.run(delta);
    },
    runSprites: function (delta) {
      for (i = 0; i < this.sprites.length; i++) {

        this.sprites[i].run(delta);

        if (this.sprites[i].reap) {
          this.sprites[i].reap = false;
          this.sprites.splice(i, 1);
          i--;
        }
      }
    }
  };

  return game;
});
