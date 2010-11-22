// The DUDE

define(["game", "sprite"], function (game, Sprite) {

  var keyStatus = game.controls.keyStatus;
  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED = 3.5;
  var WALKING_FRAME_RATE = 0.02; // in seconds

  var Dude = function (name, points, image, tileWidth, tileHeight) {
    this.init(name, points, image, tileWidth, tileHeight);

    this.driving = null;

    this.direction = RIGHT;
    this.walking = false;
    this.walkingFrame = 0;
    this.walkingFrameCounter = 0.0;

    this.draw = function (delta) {
      if (!this.visible) return;

      if (this.walking) {
        this.walkingFrameCounter += delta;
        if (this.walkingFrameCounter > WALKING_FRAME_RATE) {
          this.walkingFrameCounter = 0.0;
          this.walkingFrame = (this.walkingFrame + 1) % 4; // four frames
        }
        this.drawTile(this.walkingFrame+1, this.direction);
        this.drawTile(6, this.direction); // walking arms
      } else {
        this.drawTile(0, this.direction); // standing
        this.drawTile(5, this.direction); // standing arms
      }
    };

    this.move = function (delta) {
      if (!this.visible) return;

      if (keyStatus.space) {
        console.log(this.nearby());
      }

      this.walking = (keyStatus.left  ||
                      keyStatus.right ||
                      keyStatus.up    ||
                      keyStatus.down);

      if (keyStatus.left) {
        this.x -= SPEED;
        this.direction = LEFT;
      } else if (keyStatus.right) {
        this.x += SPEED;
        this.direction = RIGHT;
      } 
      if (keyStatus.up) {
        this.y -= SPEED;
      } else if (keyStatus.down) {
        this.y += SPEED;
      }
    };
  };
  Dude.prototype = new Sprite();

  return Dude;

});
