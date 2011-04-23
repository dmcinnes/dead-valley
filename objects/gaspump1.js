define(["game",
        "sprite",
        "collidable",
        "vector",
        "sprite-info"],
       function (game, Sprite, collidable, Vector, SpriteInfo) {

  var context = game.spriteContext;

  var info = SpriteInfo.GasPump1;

  var spriteOffset = info.imageOffset;

  var image = null;

  var config = {
    name:         'gaspump1',
    width:        info.width,
    height:       info.height
  };

  var GasPump1 = function () {
    this.init(config);

    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
    this.visible = true;

    var co = info.collidableOffset;
    this.points = [ 
      new Vector(-co.x, -co.y),
      new Vector( co.x, -co.y),
      new Vector(-co.x,  co.y),
      new Vector( co.x,  co.y)
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
                      -info.center.x,
                      -info.center.y,
                      this.tileWidth,
                      this.tileHeight);
  };

  collidable(GasPump1);

  game.assetManager.loadImage(info.img, function (img) {
    image = img;
  });

  return GasPump1;
});
