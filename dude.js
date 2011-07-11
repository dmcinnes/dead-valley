// The DUDE

define(["game", "sprite", "collidable", "spritemarshal", "DudeHands", "Inventory", "fx/BloodSplatter"],
       function (game, Sprite, collidable, spriteMarshal, DudeHands, Inventory, BloodSplatter) {

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
    this.inside              = null;

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

    this.aimDirection        = null;

    // list of things the dude is currently touching
    this.touching            = [];

    this.originalCenterX     = this.center.x;

    this.inventory           = new Inventory(9, 3);
    this.hands               = new DudeHands();

    this.setupEventHandlers();
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
        this.drawTile(14, this.direction);
      } else {
        this.drawTile(15, this.direction);
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
    this.updateTouchingList();
  };

  Dude.prototype.updateTouchingList = function () {
    // remove sprites that we are moving away from
    this.touching = _.reject(this.touching, function (sprite) {
      return this.pos.subtract(sprite.pos).dotProduct(this.vel) > 0;
    }, this);
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
    this.pos.set(this.driving.driversSideLocation());
    this.driving.leave(this);
    this.driving = null;
    this.visible = true;
  };

  Dude.prototype.enterBuilding = function (building) {
    building.enter(this);
    this.inside = building;
    this.visible = false;
    if (this.currentNode) {
      this.currentNode.leave(this);
      this.currentNode = null;
    }
  };

  Dude.prototype.leaveBuilding = function () {
    this.inside.leave(this);
    this.inside = null;
    this.visible = true;
  };

  Dude.prototype.aimTowardMouse = function (coords) {
    this.aiming = true;
    this.direction = (coords.x - this.pos.x < 0) ? LEFT : RIGHT;
    var dir = coords.subtract(this.pos);
    this.aimDirection = Math.atan2(dir.y, dir.x); // radians
  };

  Dude.prototype.saveMetadata = function () {
    if (this.driving) {
      this.pos.set(this.driving.pos);
    }
    var metadata = Sprite.prototype.saveMetadata.call(this);
    metadata.health    = this.health;
    metadata.inventory = this.inventory.saveMetadata();
    metadata.hands     = this.hands.saveMetadata();
    metadata.driving   = !!this.driving;
    metadata.inside    = !!this.inside;
    return metadata;
  };

  Dude.prototype.takeDamage = function (damage) {
    if (this.alive()) {
      this.takingDamage = true;

      BloodSplatter.splat(this.pos.clone(), '#900', damage);

      this.health -= damage;

      this.fireEvent('health changed', this.health);

      if (this.health <= 0) {
        // die
        this.collidable = false;

        // reset the frame counter
        this.walkingFrameCounter = 0;
      }
    }
  };

  Dude.prototype.drawArms = function () {
    var weapon = this.hands.weapon();
    if (weapon) {
      if (this.firing) {
        this.drawAimedArm(weapon.isHandgun ? 10 : 13);
      } else if (this.aiming) {
        this.drawAimedArm(weapon.isHandgun ? 9 : 12);
      } else if (weapon && !weapon.isHandgun) {
        this.drawTile(11, this.direction); // draw arms with rifle
      } else {
        // 7. with gun
        // 8. out with gun
        this.drawTile(7 + (this.takingDamage ? 1 : 0), this.direction);
      }
    } else {
      // 5. normal
      // 6. out
      this.drawTile(5 + (this.takingDamage ? 1 : 0), this.direction);
    }
    // activate what's in the dude's hands
    this.hands.renderItems(this);
  };

  Dude.prototype.drawAimedArm = function (frame) {
    if (!this.image || !this.aimDirection) {
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

  // TODO combine enter/leave building with enter/leave car
  Dude.prototype.enterOrExit = function () {
    if (this.driving) {
      this.leaveCar();
    } else if (this.inside) {
      this.leaveBuilding();
    } else if (this.visible) {
      // iterate through the touching list and enter the first one that we can enter
      for (var i = 0; i < this.touching.length; i++) {
	var sprite = this.touching[i];
	if (sprite.isCar) {
	  this.enterCar(sprite);
	} else if (sprite.isBuilding &&
		   this.currentNode &&
		   this.currentNode.entrance === sprite) {
	  this.enterBuilding(sprite);
	}
      }
    }
  };

  Dude.prototype.setupEventHandlers = function () {
    var self = this;

    game.events.subscribe('dude enter/exit', function () {
      self.enterOrExit();
    }).subscribe('dude toggle headlights', function () {
      if (self.driving) {
        self.driving.toggleHeadlights();
      }
    }).subscribe('reload', function () {
      // TODO move this to a better place
      var firearm = self.hands.weapon();
      if (firearm) {
        do {
          var ammo = self.inventory.findItem(firearm.ammoType);
          firearm.accept(ammo);
          if (!ammo.viable()) {
            self.inventory.removeItem(ammo);
          }
        } while (!firearm.isFull() && ammo)
      }
    });
  };

  Dude.prototype.setupMouseBindings = function () {
    var self = this;
    $('#click-overlay').mousemove(function (e) {
      if (self.alive() && self.hands.hasAimableItem()) {
        var coords = game.map.worldCoordinatesFromWindow(event.pageX, event.pageY);
        self.aimTowardMouse(coords);
      }
    }).mousedown(function (e) {
      var firearm = self.hands.weapon();
      if (self.alive() && firearm) {
        var coords = game.map.worldCoordinatesFromWindow(event.pageX, event.pageY);
        self.aimTowardMouse(coords);
        if (firearm.fire(self.pos, coords)) {
          self.firing = true;
        }
      }
    }).mouseleave(function () {
      self.aiming       = false;
      self.aimDirection = null;
    });
  };

  collidable(Dude);
  spriteMarshal(Dude);

  return Dude;

});
