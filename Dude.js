// The DUDE

define(["Game",
        "Sprite",
        "Collidable",
        "SpriteMarshal",
        "DudeHands",
        "Inventory",
        "Car",
        "Fuel",
        "fx/BloodSplatter"],

       function (Game,
                 Sprite,
                 Collidable,
                 SpriteMarshal,
                 DudeHands,
                 Inventory,
                 Car,
                 Fuel,
                 BloodSplatter) {

  var keyStatus = Game.keyboard.keyStatus;
  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var MAX_HEALTH = 6;

  var SPEED = 44; // 20 MPH
  var WALKING_ANIMATION_FRAME_RATE = 0.03; // in seconds
  var DAMAGE_ANIMATION_TIME = 0.3;  // in seconds
  var FIRING_ANIMATION_TIME = 0.1;  // in seconds

  var ARM_OFFSET_X    = 5;
  var ARM_OFFSET_Y    = 8;
  var ARM_FLIP_OFFSET = 10;


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

    this.maxHealth           = MAX_HEALTH;
    this.health              = MAX_HEALTH;
    this.takingDamage        = false;

    this.aiming              = false;
    this.firing              = false;

    this.aimDirection        = null;
    this.aimPoint            = null;

    // list of things the dude is currently touching
    this.touching            = [];

    this.originalCenterX     = this.center.x;

    this.inventory           = new Inventory({width:7, height:3});
    this.hands               = new DudeHands();

    this.aimingArmNode       = this.createNode(1);
    // set the transform origin so it rotates in the right place
    this.aimingArmNode[0].style['-webkit-transform-origin'] = ARM_OFFSET_X + ' ' + ARM_OFFSET_Y;

    this.setupEventHandlers();
    this.setupMouseBindings();
  };
  Dude.prototype = new Sprite();

  // don't save when the level is saved -- we're going to save this our own way
  Dude.prototype.shouldSave = false;

  Dude.prototype.draw = function (delta) {
    if (!this.visible) return;

    // hack so the sprite is placed correctly when it's flipped
    this.center.x = (this.direction === RIGHT) ? this.originalCenterX : this.originalCenterX + 4;

    if (this.alive()) {
      if (this.walking) {
        this.walkingFrameCounter += delta;
        if (this.walkingFrameCounter > WALKING_ANIMATION_FRAME_RATE) {
          this.walkingFrameCounter = 0.0;
          this.walkingFrame = (this.walkingFrame + 1) % 4; // four frames
        }
        this.drawTile(this.walkingFrame+1, 0);
      } else {
        this.drawTile(0, 0); // standing
      }

      this.drawArms();

    } else {
      // reusing the walkingFrameCounter 
      if (this.walkingFrameCounter < 0.6) {
        this.walkingFrameCounter += delta;
        this.drawTile(14, 0);
      } else {
        this.drawTile(15, 0);
      }
    }
  };

  Dude.prototype.finalizeLayers = function () {
    Sprite.prototype.finalizeLayers.call(this);

    // render night silhouette
    if (this.imageData) {
      var context = Game.skyContext;
      var map = Game.map;
      context.save();
      context.translate(this.pos.x - map.originOffsetX - this.center.x,
                        this.pos.y - map.originOffsetY - this.center.y);
      if (this.direction === LEFT) {
        context.translate(20, 0);
        context.scale(-1, 1);
      }
      context.globalCompositeOperation = 'destination-out';

      var length = this.layers.length;
      for (var i = length-1; i >= 0; i--) {
        var index = this.layers[i];
        if (index >= 0) {
          var left = (index * this.tileOffset) + this.imageOffset.x;
          var top  = this.imageOffset.y;
          context.drawImage(this.imageData,
                            left, top, this.tileWidth, this.tileHeight,
                            0, 0, this.tileWidth, this.tileHeight);
        }
      }
      context.restore();
    }
  };

  Dude.prototype.preMove = function (delta) {
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
      this.aimTowardMouse(this.aimPoint, false); // update so flashlight follows
      this.aiming = false;
    }

    Game.map.keepInView(this);
  };

  Dude.prototype.postMove = function (delta) {
    this.updateTouchingList();
  };

  Dude.prototype.updateTouchingList = function () {
    // remove sprites that we are moving away from
    this.touching = _.reject(this.touching, function (sprite) {
      if (!this.visible ||
	  (this.pos.subtract(sprite.pos).dotProduct(this.vel) > 0 &&
	   this.vel.magnitude() >= SPEED)) {
        this.fireEvent('stopped touching', sprite);
        return true;
      }
    }, this);
  };

  Dude.prototype.collision = function (other, point, vector) {
    // the dude abides
    this.pos.rot = 0;
    this.vel.rot = 0;

    // add other to the touching list
    if (!_.include(this.touching, other)) {
      this.touching.push(other);
      this.fireEvent('started touching', other);
    }
  };

  Dude.prototype.hide = function () {
    Sprite.prototype.hide.call(this); // super
    this.aimingArmNode[0].style.visibility = 'hidden';
  };

  Dude.prototype.enterCar = function (car) {
    if (car.enter(this)) {
      this.hide();
      this.driving = car;
      this.updateTouchingList(); // to clear what we're touching
      this.fireEvent("entered car", car);
    }
  };

  Dude.prototype.leaveCar = function () {
    var canidates = [
      this.driving.driversSideLocation(),
      this.driving.passengersSideLocation()
    ];

    do {
      var pos = canidates.shift();
      var node = Game.map.getNodeByWorldCoords(pos.x, pos.y);
      var nearby = node.nearby();
      var occupied = _.any(nearby, function (sprite) {
        return sprite.visible && sprite.checkPointCollision(pos);
      });
    } while (occupied && canidates.length);

    if (occupied) {
      var pos = canidates[0]; // just use the driver's side
    }

    this.pos.set(pos);
    this.driving.leave(this);
    var car = this.driving;
    this.driving = null;
    this.show();
    this.fireEvent("left car", car);
  };

  Dude.prototype.enterBuilding = function (building) {
    if (building.enter(this)) {
      this.hide();
      this.inside = building;
      this.updateTouchingList(); // to clear what we're touching
      this.fireEvent("entered building", building);
    }
  };

  Dude.prototype.leaveBuilding = function () {
    this.inside.leave(this);
    var building = this.inside;
    this.inside = null;
    this.show();
    this.fireEvent("left building", building);
  };

  Dude.prototype.aimTowardMouse = function (coords, setDirection) {
    coords = coords || this.aimPoint;
    if (coords) {
      this.aiming = true;
      this.aimPoint = coords;
      if (setDirection) {
        this.direction = (coords.x - this.pos.x < 0) ? LEFT : RIGHT;
      }
      var dir = coords.subtract(this.pos);
      this.aimDirection = Math.atan2(dir.y, dir.x); // radians
    }
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
        this.Collidable = false;

        // reset the frame counter
        this.walkingFrameCounter = 0;
      }
    }
  };

  Dude.prototype.heal = function (amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
    this.fireEvent('health changed', this.health);
  };

  Dude.prototype.drawArms = function () {
    this.aimingArmNode[0].style.visibility = 'hidden';
    var weapon = this.hands.weapon();
    if (weapon) {
      if (this.firing && weapon.isMeleeWeapon) {
        this.drawTile(weapon.handsSpriteOffset + 1, 1);
      } else if (this.firing) {
        this.drawAimedArm(weapon.isHandgun ? 10 : 13);
      } else if (weapon && weapon.isMeleeWeapon) {
        this.drawTile(weapon.handsSpriteOffset, 1);
      } else if (this.aiming) {
        this.drawAimedArm(weapon.isHandgun ? 9 : 12);
      } else if (weapon && !weapon.isHandgun) {
        this.drawTile(11, 1); // draw arms with rifle
      } else {
        // 7. with gun
        // 8. out with gun
        this.drawTile(7 + (this.takingDamage ? 1 : 0), 1);
      }
    } else {
      // 5. normal
      // 6. out
      this.drawTile(5 + (this.takingDamage ? 1 : 0), 1);
    }
    // activate what's in the dude's hands
    this.hands.renderItems(this);
  };

  Dude.prototype.drawAimedArm = function (frame) {
    var map = Game.map;
    var style = this.aimingArmNode[0].style;

    var x = this.pos.x - map.originOffsetX - this.center.x;
    var y = this.pos.y - map.originOffsetY - this.center.y;

    var rot = this.aimDirection;
    if (this.direction) {
      x += ARM_FLIP_OFFSET;
      rot -= Math.PI;
    }

    var transform = [];
    transform.push(' translate(', x, 'px,', y, 'px)');
    transform.push(' rotate(', rot, 'rad)');
    if (this.direction) {
      transform.push(' scaleX(-1)');
    }
    // translateZ(0) makes a big difference for Safari
    if (Game.threeDee) {
      transform.push(' translateZ(0)');
    }

    var left = -(frame * this.tileWidth) - this.imageOffset.x;
    var top  = -this.imageOffset.y;
    style['background-position'] = [left, 'px ', top, 'px'].join('');

    // TODO support FF
    style['-webkit-transform'] = transform.join('');

    style.visibility = 'visible';
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
                   this.currentNode.entrance) {
          this.enterBuilding(this.currentNode.entrance);
        }
      }
    }
  };

  Dude.prototype.setupEventHandlers = function () {
    var self = this;

    Game.events.subscribe('dude enter/exit', function () {
      self.enterOrExit();
    }).subscribe('dude toggle headlights', function () {
      if (self.driving) {
        self.driving.toggleHeadlights();
      }
    }).subscribe('reload', function () {
      // TODO move this to a better place
      // Firearm base class?
      var firearm = self.hands.weapon();
      if (firearm && firearm.ammoType) {
        do {
          var ammo = self.inventory.findItem(firearm.ammoType);
	  if (ammo) {
	    firearm.accept(ammo);
	    if (!ammo.viable()) {
	      self.inventory.removeItem(ammo);
	    }
	  }
        } while (!firearm.isFull() && ammo)
      }
    }).subscribe('map scroll', function (vec) {
      if (self.aimPoint) {
        self.aimPoint.translate(vec);
      }
    }).subscribe('mousedown', function (event, clickedSprite) {
      if (self.alive()) {

        // TODO maybe a better place for this
        var pump = Fuel.activePump;
        if (pump) {

          if (clickedSprite &&
              clickedSprite.isCar &&
              clickedSprite.health > 0 &&
              pump.isCarCloseEnough &&
              pump.isCarCloseEnough(clickedSprite)) {
            pump.startFueling(clickedSprite);
          }

        } else {

          var firearm = self.hands.weapon();
          if (firearm) {
            var coords = Game.map.worldCoordinatesFromWindow(event.pageX, event.pageY);

            if (firearm.aimable) {
              self.aimTowardMouse(coords, true);
            }

            if (firearm.fire(self.pos, coords, self.direction)) {
              self.firing = true;
            }
          }

        }

      }
    }).subscribe('space', function () {
      var firearm = self.hands.weapon();
      if (firearm &&
          firearm.isMeleeWeapon &&
          firearm.fire(self.pos, self.pos, self.direction)) {
        self.firing = true;
      }
    });
  };

  Dude.prototype.setupMouseBindings = function () {
    var self = this;
    $('#click-overlay').mousemove(function (e) {
      if (self.alive()) {
        var coords = Game.map.worldCoordinatesFromWindow(e.pageX, e.pageY);
        self.aimTowardMouse(coords, true);
      }
    }).mouseleave(function () {
      self.aiming       = false;
      self.aimDirection = null;
      self.aimPoint     = null;
    });
  };

  Collidable(Dude);
  SpriteMarshal(Dude);

  return Dude;

});
