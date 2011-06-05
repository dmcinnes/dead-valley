// The DUDE

define(["game", "sprite", "collidable", "spriteMarshal", "LifeMeter"],
       function (game, Sprite, collidable, spriteMarshal, LifeMeter) {

  var keyStatus = game.controls.keyStatus;
  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED = 44; // 20 MPH
  var WALKING_ANIMATION_FRAME_RATE = 0.03; // in seconds
  var DAMAGE_ANIMATION_TIME = 0.3;  // in seconds

  var Dude = function () {
    this.init('Dude');

    this.driving             = null;

    this.direction           = RIGHT;
    this.walking             = false;
    this.walkingFrame        = 0;
    this.walkingFrameCounter = 0;
    this.damageFrameCounter  = 0;

    this.mass                = 0.001;
    this.inertia             = 1;

    this.health              = 6;
    this.takingDamage        = false;
    this.alive               = true;

    // list of things the dude is currently touching
    this.touching            = [];

    this.originalCenterX     = this.center.x;

    this.setupKeyBindings();
  };
  Dude.prototype = new Sprite();

  // don't save when the level is saved -- we're going to save this our own way
  Dude.prototype.shouldSave = false;

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
    } else {
      this.drawTile(0, this.direction); // standing
    }

    if (this.takingDamage) {
      this.drawTile(6, this.direction); // out arms
    } else {
      this.drawTile(5, this.direction); // arms
    }
  };

  Dude.prototype.preMove = function (delta) {
    if (!this.visible) return;

    // takingDamage is only set for DAMAGE_ANIMATION_TIME
    if (this.takingDamage) {
      this.damageFrameCounter += delta;
      if (this.damageFrameCounter > DAMAGE_ANIMATION_TIME) {
        this.takingDamage = false;
        this.damageFrameCounter = 0;
      }
    }

    // clear velocity
    this.vel.set(0, 0);

    if (!this.alive) return; // he's dead Jim

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

  Dude.prototype.enterCar = function (car) {
    car.enter(this);
    this.driving = car;
    this.visible = false;
    if (this.currentNode) {
      this.currentNode.leave(this);
      this.currentNode = null;
    }
  };

  Dude.prototype.leaveCar = function () {
    this.driving.shouldSave = true;
    this.pos.set(this.driving.driversSideLocation());
    this.driving.leave(this);
    this.driving = null;
    this.visible = true;
  };

  // TODO find a better place for this
  Dude.prototype.setupKeyBindings = function () {
    var self = this;
    game.controls.registerKeyDownHandler('x', function () {
      if (self.driving) {
        self.leaveCar();
      } else if (self.visible) {
        // find all the cars we're touching
        var cars = _(self.touching).select(function (sprite) {
          return !!sprite.isCar;
        });
        if (cars.length > 0) {
          // find the closest
          var car = _(cars).reduce(function (closest, car) {
            return (self.distance(car) < self.distance(closest)) ? car : closest;
          }, cars[0]);

          self.enterCar(car);
        }
      }
    });

    game.controls.registerKeyDownHandler('h', function () {
      if (self.driving) {
        self.driving.toggleHeadlights();
      }
    });
  };

  Dude.prototype.saveMetadata = function () {
    var metadata = this.driving ?
                   this.driving.saveMetadata() :
                   Sprite.prototype.saveMetadata.call(this);
    return metadata;
  };

  Dude.prototype.takeDamage = function (damage) {
    if (this.alive) {
      this.takingDamage = true;

      this.health -= damage;

      LifeMeter.updateHealth(this.health);

      if (this.health <= 0) {
        // die
        this.alive = false;
        this.collidable = false;
        // move the dude to the bottom of the pile
        this.z = 1;
        game.resortSprites();
      }
    }
  };

  collidable(Dude);
  spriteMarshal(Dude);

  return Dude;

});
