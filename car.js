// Car

define(["game", "sprite"], function (game, Sprite) {

  var context = game.spriteContext;

  var Car = function (name, points, image) {
    this.init(name, points);
    this.image = image;

    this.draw = function () {
      if (!this.visible) return;

      context.drawImage(image,
                        this.x + points[0],
                        this.y + points[1]);
    };
  };
  Car.prototype = new Sprite();

  return Car;
});
