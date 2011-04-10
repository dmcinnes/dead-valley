// The DUDE

define(["game", "sprite", "collidable"], function (game, Sprite, collidable) {

  var keyStatus = game.controls.keyStatus;
  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED = 44; // 20 MPH
  var WALKING_ANIMATION_FRAME_RATE = 0.03; // in seconds

  var Dude = function (config) {
    config.name = 'Dude';
    this.init(config);

    this.driving = null;

    this.direction = RIGHT;
    this.walking = false;
    this.walkingFrame = 0;
    this.walkingFrameCounter = 0.0;

    this.mass = 0.001;
    this.inertia = 1;

    this.draw = function (delta) {
      if (!this.visible) return;

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

    this.preMove = function (delta) {
      if (!this.visible) return;

      // clear velocity
      this.vel.set(0, 0);

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

    this.postMove = function (delta) {
    };

    this.collision = function (other, point, vector) {
      // the dude abides
      this.pos.rot = 0;
      this.vel.rot = 0;
    };

    var self = this;
    game.controls.registerKeyDownHandler('x', function () {
      if (self.driving) {
        // leave the car
        self.pos.set(self.driving.driversSideLocation());
        self.driving.driver = null;
        self.driving = null;
        self.visible = true;
      } else if (self.visible) {
        var cars = _(self.nearby()).select(function (sprite) {
          return sprite.name === "car";
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
	  self.currentNode.leave(this);
	  self.currentNode = null;
        }
      }
    });

    game.controls.registerKeyDownHandler('h', function () {
      if (self.driving) {
        self.driving.toggleHeadlights();
      }
    });

    // game.controls.registerKeyDownHandler('p', function () {
    //   var spr = (self.driving) ? self.driving : self;
    //   console.log(spr.pos.x, spr.pos.y, game.sprites);
    // });
  };
  Dude.prototype = new Sprite();

  collidable(Dude);

  return Dude;

});
