define(["sprite", "collidable", "game"], function (Sprite, collidable, game) {

  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED = 22; // 10 MPH
  var WALKING_ANIMATION_FRAME_RATE = 0.3; // in seconds
  var SCAN_TIMEOUT_RESET = 1; // in seconds

  var Zombie = function () {
    this.init('Zombie');

    this.target              = null;
    this.seeTarget           = false;
    this.direction           = RIGHT;
    this.walking             = false;
    this.walkingFrame        = 0;
    this.walkingFrameCounter = 0.0;
    this.scanTimeout         = SCAN_TIMEOUT_RESET;

    this.currentState        = this.states.waiting;

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

  Zombie.prototype.lookForTargets = function () {
    this.seeTarget = false;
    // dude is the only target for now
    // TODO limit the distance the zombie can see
    var dude = game.dude;
    if (dude && this.canSee(dude)) {
      this.target    = dude.pos.clone();
      this.targetVel = dude.vel.clone();
      this.seeTarget = true;
    }
  };

  Zombie.prototype.clearTarget = function () {
    this.target    = null;
    this.targetVel = null;
    this.seeTarget = false;
  };

  Zombie.prototype.preMove = function (delta) {
    this.scanTimeout -= delta;
    if (this.scanTimeout < 0) {
      this.scanTimeout = SCAN_TIMEOUT_RESET;
      this.lookForTargets();
    }

    if (this.seeTarget) {
      this.currentState = this.states.stalking;
    }

    this.currentState.call(this);

    if (this.vel.x) {
      this.direction = (this.vel.x > 0) ? RIGHT : LEFT;
    }
  };

  Zombie.prototype.collision = function (other, point, vector) {
    // zombies don't rotate
    this.pos.rot = 0;
    this.vel.rot = 0;
  };

  Zombie.prototype.moveToward = function (pos) {
    var mosey = pos.subtract(this.pos).normalize().scale(SPEED);
    this.vel.set(mosey);
  };

  Zombie.prototype.states = {
    waiting: function () {
      this.walking = false;
      this.vel.scale(0);
    },
    wandering: function () {
      this.walking = true;

      // TODO move around a bit
    },
    searching: function () {
      this.walking = true;

      if (this.target) {
        var distance = this.target.subtract(this.pos).magnitude();
        if (distance > 5) {
          this.moveToward(this.target);
        } else {
          // got to the target
          this.target = null;
          this.vel.scale(0);
        }
      } else if (this.targetVel) {
        // move in the last direction seen for a bit
        this.target = this.targetVel.normalize().scale(300).translate(this.pos);
        this.targetVel = null;
      } else {
        this.currentState = this.states.wandering;
      }
    },
    stalking: function () {
      var mosey = this.target.subtract(this.pos).normalize().scale(SPEED);
      this.vel.set(mosey);
      this.walking = true;

      if (!this.seeTarget) {
        this.currentState = this.states.searching;
      }
    },
    attacking: function () {
    },
    thriller: function () {
      // TODO hehe yes
    }
  };

  collidable(Zombie);

  return Zombie;
});
