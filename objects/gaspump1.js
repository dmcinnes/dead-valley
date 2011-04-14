define(["game",
        "sprite",
        "collidable",
        "vector"],
       function (game, Sprite, collidable, Vector) {

  var context = game.spriteContext;

  var spriteOffset = new Vector(0, 6);

  var image = null;

  var config = {
    name:         'gaspump',
    width:        28,
    height:       16
  };

  var GasPump1 = function () {
    this.init(config);

    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
    this.visible = true;

    this.points = [ 
      new Vector(-10.5, -5),
      new Vector( 10.5, -5),
      new Vector(-10.5,  5),
      new Vector( 10.5,  5)
    ];

    window.gp = this;
  };
  GasPump1.prototype = new Sprite();

  GasPump1.prototype.move = function (delta) {
  };
  GasPump1.prototype.transformNormals = function () {
  };

  GasPump1.prototype.draw = function (delta) {
    if (!this.visible ||
        !image) {
      return;
    }

    context.drawImage(image,
                      spriteOffset.x,
                      spriteOffset.y,
                      this.tileWidth,
                      this.tileHeight,
                      -18.5,
                      -2,
                      this.tileWidth,
                      this.tileHeight);
  };

  collidable(GasPump1);

  game.assetManager.registerImageLoadCallback('objects', function (img) {
    image = img;
  });

  return GasPump1;
});
