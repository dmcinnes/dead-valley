// the ubiquitous barrel

define(["game", "sprite", "collidable"], function (game, Sprite, collidable) {

  var context = game.spriteContext;

  var Barrel = function (config) {
    config.name = 'barrel';
    this.init(config);

    this.spriteOffset = config.spriteOffset;
    this.mass = 0.1;
    this.inertia = 10;
  };
  Barrel.prototype = new Sprite();

  Barrel.prototype.draw = function (delta) {
    if (!this.visible) return;

      context.drawImage(this.image,
                        this.spriteOffset.x,
                        this.spriteOffset.y,
                        this.tileWidth,
                        this.tileHeight,
                        this.points[0].x,
                        this.points[0].y,
                        this.tileWidth,
                        this.tileHeight);
  };

  Barrel.prototype.preMove = function (delta) {
    if (!this.visible) return;

    this.vel.translate(this.vel.clone().scale(-0.8 * delta));
    this.vel.rot -= this.vel.rot * 0.8 * delta;
  };

  collidable(Barrel, {
    scenery: true,
    car:     true,
    Dude:    true,
    barrel:  true
  });

  return Barrel;
});
