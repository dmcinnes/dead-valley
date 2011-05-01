define(["sprite", "collidable", "game"], function (Sprite, collidable, game) {

  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED = 22; // 10 MPH
  var WALKING_ANIMATION_FRAME_RATE = 0.3; // in seconds

  var Zombie = function () {
    this.init('Zombie');

    this.direction           = RIGHT;
    this.walking             = true;
    this.walkingFrame        = 0;
    this.walkingFrameCounter = 0.0;

    this.mass    = 0.001;
    this.inertia = 1;
  };
  Zombie.prototype = new Sprite();

  Zombie.prototype.draw = function (delta) {
    if (this.walking) {
      this.walkingFrameCounter += delta;
      if (this.walkingFrameCounter > WALKING_ANIMATION_FRAME_RATE) {
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

  Zombie.prototype.preMove = function (delta) {
    var mosey = game.dude.pos.subtract(this.pos).normalize().scale(SPEED);
    this.vel.set(mosey);

    if (this.vel.x) {
      this.direction = (this.vel.x > 0) ? RIGHT : LEFT;
    }
  };

  Zombie.prototype.collision = function (other, point, vector) {
    // zombies don't rotate
    this.pos.rot = 0;
    this.vel.rot = 0;
  };

  Zombie.prototype.states = {
    waiting: function () {
    },
    wandering: function () {
    },
    attacking: function () {
    }
  };

  collidable(Zombie);

  return Zombie;
});
