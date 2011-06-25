// The DUDE

define(["game", "sprite", "collidable", "spriteMarshal", "DudeHands", "fx/BloodSplatter"],
       function (game, Sprite, collidable, spriteMarshal, DudeHands, BloodSplatter) {

  var context = game.spriteContext;

  var keyStatus = game.keyboard.keyStatus;
  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED = 44; // 20 MPH
  var WALKING_ANIMATION_FRAME_RATE = 0.03; // in seconds
  var DAMAGE_ANIMATION_TIME = 0.3;  // in seconds
  var FIRING_ANIMATION_TIME = 0.1;  // in seconds

  var ARM_OFFSET_X    = 5;
  var ARM_OFFSET_Y    = 8;
  var ARM_FLIP_OFFSET = 2;

  var Dude = function () {
    this.init('Dude');

    this.driving             = null;

    this.direction           = RIGHT;
    this.walking             = false;
    this.walkingFrame        = 0;
    this.walkingFrameCounter = 0;
    this.damageFrameCounter  = 0;
    this.firingFrameCounter  = 0;

    this.mass                = 0.001;
    this.inertia             = 1;

    this.health              = 6;
    this.takingDamage        = false;

    this.aiming              = false;
    this.firing              = false;

    this.aimDirection        = 0;

    // list of things the dude is currently touching
    this.touching            = [];

    this.originalCenterX     = this.center.x;

    this.setupKeyBindings();
    this.setupMouseBindings();
  };
  Dude.prototype = new Sprite();

  // don't save when the level is saved -- we're going to save this our own way
  Dude.prototype.shouldSave = false;

  Dude.prototype.draw = function (delta) {
    if (!this.visible) return;

    // hack so the sprite is placed correctly when its flipped
    this.center.x = (this.direction == RIGHT) ? this.originalCenterX : this.originalCenterX - 4;

    if (this.alive()) {
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

      this.drawArms();

    } else {
      // reusing the walkingFrameCounter 
      if (this.walkingFrameCounter < 0.6) {
        this.walkingFrameCounter += delta;
        this.drawTile(11, this.direction);
      } else {
        this.drawTile(12, this.direction);
      }
    }
  };

  Dude.prototype.preMove = function (delta) {
    if (!this.visible) return;

    // TODO generalize this animation handling
    // takingDamage is only set for DAMAGE_ANIMATION_TIME
    if (this.takingDamage) {
      this.damageFrameCounter += delta;
      if (this.damageFrameCounter > DAMAGE_ANIMATION_TIME) {
        this.takingDamage = false;
        this.damageFrameCounter = 0;
      }
    }

    // firing is only set for FIRING_ANIMATION_TIME
    if (this.firing) {
      this.firingFrameCounter += delta;
      if (this.firingFrameCounter > FIRING_ANIMATION_TIME) {
        this.firing = false;
        this.firingFrameCounter = 0;
      }
    }

    // clear velocity
    this.vel.set(0, 0);

    if (!this.alive()) return; // he's dead Jim

    // clear touching list
    this.touching.splice(0);

    this.walking = (keyStatus.left  ||
                    keyStatus.right ||
                    keyStatus.up    ||
                    keyStatus.down);

    if (!this.firing) {
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
    }

    if (this.walking) {
      this.aiming = false;
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
    game.keyboard.registerKeyDownHandler('x', function () {
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

    game.keyboard.registerKeyDownHandler('h', function () {
      if (self.driving) {
        self.driving.toggleHeadlights();
      }
    });
  };

  Dude.prototype.aimTowardMouse = function (coords) {
    this.aiming = true;
    this.direction = (coords.x - this.pos.x < 0) ? LEFT : RIGHT;
    var dir = coords.subtract(this.pos);
    this.aimDirection = Math.atan2(dir.y, dir.x); // radians
  };

  Dude.prototype.setupMouseBindings = function () {
    var self = this;
    $('#canvas-mask').mousemove(function (e) {
      if (self.alive() && DudeHands.weapon()) {
        var coords = game.map.worldCoordinatesFromWindow(event.pageX, event.pageY);
        self.aimTowardMouse(coords);
      }
    }).mousedown(function (e) {
      var firearm = DudeHands.weapon();
      if (self.alive() && firearm) {
        var coords = game.map.worldCoordinatesFromWindow(event.pageX, event.pageY);
        self.aimTowardMouse(coords);
        if (firearm.fire(self.pos, coords)) {
          self.firing = true;
        }
      }
    }).mouseleave(function () {
      self.aiming = false;
    });
  };

  Dude.prototype.saveMetadata = function () {
    var metadata = this.driving ?
                   this.driving.saveMetadata() :
                   Sprite.prototype.saveMetadata.call(this);
    metadata.health = this.health;
    return metadata;
  };

  Dude.prototype.takeDamage = function (damage) {
    if (this.alive()) {
      this.takingDamage = true;

      BloodSplatter.splat(this.pos.clone(), '#900');

      this.health -= damage;

      this.fireEvent('health changed', this.health);

      if (this.health <= 0) {
        // die
        this.collidable = false;

        // move the dude to the bottom of the pile
        this.z = 1;
        game.resortSprites();

        // reset the frame counter
        this.walkingFrameCounter = 0;
      }
    }
  };

  Dude.prototype.drawArms = function () {
    if (this.firing) {
      this.drawAimedArm(10);
    } else if (this.aiming) {
      this.drawAimedArm(9);
    } else {
      // arm tiles are like this:
      // 5. normal
      // 6. with gun
      // 7. out
      // 8. out with gun
      var offset = DudeHands.weapon() ? 2 : 0;
      offset += this.takingDamage ? 1 : 0;
      this.drawTile(5 + offset, this.direction);
    }
  };

  Dude.prototype.drawAimedArm = function (frame) {
    if (!this.image) {
      return;
    }
    context.save();
    if (this.direction) {
      context.translate(-this.center.x + ARM_OFFSET_X + ARM_FLIP_OFFSET, -this.center.y + ARM_OFFSET_Y);
      context.rotate(this.aimDirection - Math.PI);
      context.scale(-1, 1);
    } else {
      context.translate(-this.center.x + ARM_OFFSET_X, -this.center.y + ARM_OFFSET_Y);
      context.rotate(this.aimDirection);
    }
    context.drawImage(this.image,
		      this.imageOffset.x + frame * this.tileWidth,
		      this.imageOffset.y,
		      this.tileWidth,
		      this.tileHeight,
		      -ARM_OFFSET_X,
		      -ARM_OFFSET_Y,
		      this.tileWidth,
		      this.tileHeight);
    context.restore();
  };

  Dude.prototype.alive = function () {
    return this.health > 0;
  };

  collidable(Dude);
  spriteMarshal(Dude);

  return Dude;

});
