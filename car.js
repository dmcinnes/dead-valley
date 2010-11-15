// Car

define(["game", "sprite"], function (game, Sprite) {

  var context = game.spriteContext;
  var keyStatus = game.controls.keyStatus;

  var Car = function (name, points, image) {
    var rad, speed;

    this.init(name, points);
    this.image = image;

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
      speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);

      if (keyStatus.left || keyStatus.right) {
        this.vel.rot = delta * speed * (keyStatus.left ? -1 : 1);
      }
      this.rot += this.vel.rot;

      rad = ((this.rot-90) * Math.PI)/180;
      this.acc.x = 0;
      this.acc.y = 0;
      if (keyStatus.up || keyStatus.down) {
        this.acc.x = delta * Math.cos(rad);
        this.acc.y = delta * Math.sin(rad);
        if (keyStatus.down) {
          this.acc.x *= -1;
          this.acc.y *= -1;
        }
      }

      this.vel.x = speed * Math.cos(rad) + this.acc.x;
      this.vel.y = speed * Math.sin(rad) + this.acc.y;

      this.x += this.vel.x;
      this.y += this.vel.y;
    };

  };
  Car.prototype = new Sprite();

  return Car;
});
