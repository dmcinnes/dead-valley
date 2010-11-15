// Car

define(["game", "sprite"], function (game, Sprite) {

  var context = game.spriteContext;
  var keyStatus = game.controls.keyStatus;

  var Car = function (name, points, image) {
    var rad, rot;

    this.init(name, points);
    this.image = image;
    this.speed = 0.0;

    this.acceleration    = 500;
    this.topSpeed        = 440;  // tops out at 100mph
    this.topReverseSpeed = -132; // reverse at 30mph
    this.topRotation     = 120;

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
        if (rot > this.topRotation) rot = this.topRotation;
        this.vel.rot = rot * delta * (keyStatus.left ? -1 : 1);
      }
      this.rot += this.vel.rot;

      if (keyStatus.up) {
        this.speed += delta * this.acceleration;
      } else if (keyStatus.down) {
        this.speed -= delta * this.acceleration;
      } else {
        // friction!
        this.speed += delta * 10 * (this.speed > 0) ? -1 : 1;
      }

      if (this.speed > this.topSpeed) this.speed = this.topSpeed;
      if (this.speed < this.topReverseSpeed) this.speed = this.topReverseSpeed;

      rad = ((this.rot-90) * Math.PI)/180;

      this.vel.x = this.speed * Math.cos(rad) * delta;
      this.vel.y = this.speed * Math.sin(rad) * delta;

      this.x += this.vel.x;
      this.y += this.vel.y;

      game.map.keepInView(this);
    };

  };
  Car.prototype = new Sprite();

  return Car;
});
