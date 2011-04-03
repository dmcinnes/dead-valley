// the ubiquitous barrel

define(["game",
        "sprite",
        "collidable",
        "vector"],
       function (game, Sprite, collidable, Vector) {

  var context = game.spriteContext;

  var spriteOffset = new Vector(78, 0);

  var friction = -0.8;

  var image = null;

  var config = {
    name:         'barrel',
    width:        16,
    height:       16
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

  game.assetManager.registerImageLoadCallback('objects', function (img) {
    image = img;
  });

  return Barrel;
});
