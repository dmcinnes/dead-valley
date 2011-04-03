// the ubiquitous barrel

define(["game",
        "sprite",
        "collidable",
        "vector"],
       function (game, Sprite, collidable, Vector) {

  var context = game.spriteContext;

  var spriteOffset = new Vector(78, 0);

  var friction = -0.8;

  var config = {
    name:         'barrel',
    width:        16,
    height:       16
  };

  var Barrel = function () {
    this.init(config);

    this.mass    = 0.1;
    this.inertia = 10;
    this.visible = true;
  };
  Barrel.prototype = new Sprite();

  Barrel.prototype.draw = function (delta) {
    if (!this.visible ||
        !Barrel.image) {
      return;
    }

    context.drawImage(Barrel.image,
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

  game.assetManager.registerImageLoadCallback('objects', function (image) {
    Barrel.image = image;
  });

  return Barrel;
});
