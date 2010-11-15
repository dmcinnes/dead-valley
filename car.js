// Car

define(["game", "sprite"], function (game, Sprite) {

  var context = game.spriteContext;
  var keyStatus = game.controls.keyStatus;

  var Car = function (name, points, image) {
    var rad, rot;

    this.init(name, points);
    this.image = image;
    this.speed = 0.0;

    this.draw = function () {
      if (!this.visible) return;

      context.drawImage(image,
                        points[0],
                        points[1]);
    };

    // override move
    this.move = function (delta) {
      if (!this.visible) return;

      this.vel.rot = 0;

      if (keyStatus.left || keyStatus.right) {
        rot = this.speed;
        if (rot > 180) rot = 180;
        this.vel.rot = rot * delta * (keyStatus.left ? -1 : 1);
      }
      this.rot += this.vel.rot;

      if (keyStatus.up) {
        this.speed += delta * 500;
      } else if (keyStatus.down) {
        this.speed -= delta * 500;
      } else {
        // friction!
        this.speed += delta * 10 * (this.speed > 0) ? -1 : 1;
      }

      if (this.speed >  440) this.speed = 440;  // tops out at 100mph
      if (this.speed < -132) this.speed = -132; // reverse at 30mph

      rad = ((this.rot-90) * Math.PI)/180;

      this.vel.x = this.speed * Math.cos(rad) * delta;
      this.vel.y = this.speed * Math.sin(rad) * delta;

      this.x += this.vel.x;
      this.y += this.vel.y;
    };

  };
  Car.prototype = new Sprite();

  return Car;
});
