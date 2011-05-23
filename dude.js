// The DUDE

define(["game", "sprite", "collidable", "spriteMarshal"],
       function (game, Sprite, collidable, spriteMarshal) {

  var keyStatus = game.controls.keyStatus;
  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED = 44; // 20 MPH
  var WALKING_ANIMATION_FRAME_RATE = 0.03; // in seconds

  var Dude = function () {
    this.init('Dude');

    this.driving = null;

    this.direction = RIGHT;
    this.walking = false;
    this.walkingFrame = 0;
    this.walkingFrameCounter = 0.0;

    this.mass = 0.001;
    this.inertia = 1;

    // list of things the dude is currently touching
    this.touching = [];

    this.originalCenterX = this.center.x;

    this.setupKeyBindings();
  };
  Dude.prototype = new Sprite();

  Dude.prototype.draw = function (delta) {
    if (!this.visible) return;

    // hack so the sprite is placed correctly when its flipped
    this.center.x = (this.direction == RIGHT) ? this.originalCenterX : this.originalCenterX - 4;

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

  Dude.prototype.preMove = function (delta) {
    if (!this.visible) return;

    // clear velocity
    this.vel.set(0, 0);

    // clear touching list
    this.touching.splice(0);

    this.walking = (keyStatus.left  ||
                    keyStatus.right ||
                    keyStatus.up    ||
                    keyStatus.down);

    if (keyStatus.left) {
      this.vel.x = -SPEED;
      this.direction = LEFT;
    } else if (keyStatus.right) {
      this.vel.x = SPEED;
      this.direction = RIGHT;
    } 
    if (keyStatus.up) {
      this.vel.y = -SPEED;
    } else if (keyStatus.down) {
      this.vel.y = SPEED;
    }

    game.map.keepInView(this);
  };

  Dude.prototype.postMove = function (delta) {
  };

  Dude.prototype.collision = function (other, point, vector) {
    // the dude abides
    this.pos.rot = 0;
    this.vel.rot = 0;

    // add other to the touching list
    this.touching.push(other);
  };

  // TODO find a better place for this
  Dude.prototype.setupKeyBindings = function () {
    var self = this;
    game.controls.registerKeyDownHandler('x', function () {
      if (self.driving) {
        // leave the car
        self.pos.set(self.driving.driversSideLocation());
        self.driving.leave(self);
        self.driving = null;
        self.visible = true;
      } else if (self.visible) {
        var cars = _(self.touching).select(function (sprite) {
          return !!sprite.isCar;
        });
        if (cars.length > 0) {
          // find the closest
          var car = _(cars).reduce(function (closest, car) {
            return (self.distance(car) < self.distance(closest)) ? car : closest;
          }, cars[0]);

          // get in the car
          car.driver = self;
          self.driving = car;
          self.visible = false;
          self.currentNode.leave(self);
          self.currentNode = null;
        }
      }
    });

    game.controls.registerKeyDownHandler('h', function () {
      if (self.driving) {
        self.driving.toggleHeadlights();
      }
    });
  };

  collidable(Dude);
  spriteMarshal(Dude);

  return Dude;

});
