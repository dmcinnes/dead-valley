// the ubiquitous barrel

define(["game",
        "sprite",
        "collidable",
        "vector",
        "sprite-info"],
       function (game, Sprite, collidable, Vector, SpriteInfo) {

  var context = game.spriteContext;

  var info = SpriteInfo.Barrel;

  var spriteOffset = info.imageOffset;

  var friction = -0.8;

  var image = null;

  var config = {
    name:         'barrel',
    width:        info.width,
    height:       info.height
  };

  var Barrel = function () {
    this.init(config);

    this.mass    = 0.2;
    this.inertia = 10;
    this.visible = true;
  };
  Barrel.prototype = new Sprite();

  Barrel.prototype.draw = function (delta) {
    if (!this.visible ||
        !image) {
      return;
    }

    context.drawImage(image,
                      spriteOffset.x,
                      spriteOffset.y,
                      this.tileWidth,
                      this.tileHeight,
                      this.points[0].x,
                      this.points[0].y,
                      this.tileWidth,
                      this.tileHeight);
  };

  Barrel.prototype.preMove = function (delta) {
    if (!this.visible) return;

    this.vel.translate(this.vel.clone().scale(friction * delta));
    this.vel.rot += this.vel.rot * friction * delta;
  };

  collidable(Barrel);

  game.assetManager.loadImage(info.img, function (img) {
    image = img;
  });

  return Barrel;
});
