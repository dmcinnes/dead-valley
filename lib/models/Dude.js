// The DUDE

define(["Game",
        "SpriteModel",
        "Collidable",
        "SpriteMarshal",
        "DudeHands",
        "Inventory",
        "Fuel",
        "Reporter",
        "GameTime"],

       function (Game,
                 SpriteModel,
                 Collidable,
                 SpriteMarshal,
                 DudeHands,
                 Inventory,
                 Fuel,
                 Reporter,
                 GameTime) {


  var MAX_HEALTH = 6;

  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED = 44; // 20 MPH
  var DAMAGE_ANIMATION_TIME        = 0.3;  // in seconds
  var FIRING_ANIMATION_TIME        = 0.1;  // in seconds
  var INVULNERABILITY_TIME         = 5;    // in seconds

  var DROP_PICKUP_DISTANCE = 8;

  var keyStatus = Game.keyboard.keyStatus;


  var Dude = function () {
    this.init('Dude');

    this.driving                = null;
    this.inside                 = null;

    this.direction              = RIGHT;
    this.walking                = false;
    this.invulnerabilityCounter = 0;
    this.damageFrameCounter     = 0;
    this.firingFrameCounter     = 0;

    this.mass                   = 0.001;
    this.inertia                = 1;

    this.maxHealth              = MAX_HEALTH;
    this.health                 = MAX_HEALTH;
    this.takingDamage           = false;

    this.aiming                 = false;
    this.firing                 = false;

    this.aimDirection           = null;
    this.aimPoint               = null;

    // list of things the dude is currently touching
    this.touching               = [];

    this.ignores                = {};

    this.originalCenterX        = this.center.x;

    this.inventory              = new Inventory({width:7, height:3});
    this.hands                  = new DudeHands();

    this.setupEventHandlers();
  };
  Dude.prototype = new SpriteModel();

  // don't save when the level is saved -- we're going to save this our own way
  Dude.prototype.shouldSave = false;

  Dude.prototype.preMove = function (delta) {
    this.updateTouchingList();

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
      this.aimTowardPoint(this.aimPoint, false); // update so flashlight follows
      this.aiming = false;
    }

    if (this.invulnerabilityCounter > 0) {
      this.invulnerabilityCounter -= delta;
      if (this.invulnerabilityCounter < 0) {
        this.invulnerabilityCounter = 0;
        // remove the zombie filter
        this.ignores.Zombie = false;
      }
    }

    Reporter.walkedDistance(this.vel.magnitude() * delta);

    Game.map.keepInView(this);

    // hack so the sprite is placed correctly when it's flipped
    this.center.x = (this.direction === RIGHT) ? this.originalCenterX : this.originalCenterX + 4;
  };

  Dude.prototype.postMove = function (delta) {
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

    if (other.isDrop) {
      if (this.distance(other) < DROP_PICKUP_DISTANCE &&
          this.inventory.stuffItemIn(other.item)) {
        other.die();
      }
    } else if (!_.include(this.touching, other)) {
      // add other to the touching list
      this.touching.push(other);
      this.fireEvent('started touching', other);
    }
  };

  Dude.prototype.hide = function () {
    SpriteModel.prototype.hide.call(this); // super
    if (this.currentNode) {
      this.currentNode.leave(this);
      this.currentNode = null;
    }
  };

  Dude.prototype.enterCar = function (car) {
    if (car.enter(this)) {
      this.moved = false; // keep track of whether the car has moved
      this.hide();
      this.driving = car;
      this.updateTouchingList(); // to clear what we're touching
      this.fireEvent("entered car", car);
    }
  };

  Dude.prototype.leaveCar = function () {
    var canidates, pos, node, nearby, occupied;

    if (this.moved) {
      canidates = [
        this.driving.driversSideLocation(),
        this.driving.passengersSideLocation()
      ];

      do {
        pos      = canidates.shift();
        node     = Game.map.getNodeByWorldCoords(pos.x, pos.y);
        nearby   = node.nearby();
        occupied = _.any(nearby, function (sprite) {
          return sprite.visible && sprite.checkPointCollision(pos);
        });
      } while (occupied && canidates.length);

      if (occupied) {
        pos = canidates[0]; // just use the driver's side
      }

      this.pos.set(pos);
    }

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

  Dude.prototype.aimTowardPoint = function (coords, setDirection) {
    coords = coords || this.aimPoint;
    if (coords) {
      this.aiming = true;
      if (this.aimPoint) {
        this.aimPoint.free();
      }
      this.aimPoint = coords;
      this.aimPoint.retain();
      if (setDirection) {
        this.direction = (coords.x - this.pos.x < 0) ? LEFT : RIGHT;
      }
      var dir = coords.subtract(this.pos);
      this.aimDirection = dir.angle(); // radians
    }
  };

  Dude.prototype.saveMetadata = function () {
    var metadata = SpriteModel.prototype.saveMetadata.call(this);
    metadata.health    = this.health;
    metadata.inventory = this.inventory.saveMetadata();
    metadata.hands     = this.hands.saveMetadata();
    metadata.driving   = !!this.driving;
    metadata.inside    = !!this.inside;
    if (this.driving) {
      metadata.pos = this.driving.pos.clone().round();
    }
    return metadata;
  };

  Dude.prototype.takeDamage = function (damage, point, other, collision) {
    if (this.alive() &&
        damage > 0 &&
        this.invulnerabilityCounter <= 0) {

      this.takingDamage = true;

      // BloodSplatter.splat(this.pos.clone(), '#900', damage);

      this.health -= damage;

      this.fireEvent('health changed', this.health);

      if (this.health <= 0) {
        // die
        this.Collidable = false;

        var reason = null;
        if (other) {
          var inhead = (damage > other.damage) ? 'in the head ' : '';
          if (other.isZombie) {
            reason = 'mauled by a Zombie';
          } else if (other.isCar) {
            reason = 'run over by a runaway ';
            if (other.color) {
              reason += other.color + ' ';
            }
            reason += other.name;
          } else if (other.name === 'Barrel') {
            reason = 'run over by a barrel';
          } else if (other.name === 'Explosion') {
            if (other.originObject) {
              reason = 'blown away by an exploding ' + other.originObject.name;
            } else {
              reason = 'exploded';
            }
          }
        } else if (damage === 999) {
          reason = 'killed by genocidal confusion';
        }

        if (!reason) {
          reason = 'dispatched by unknown causes!';
        }

        Reporter.dudeDeath(reason);

      } else if (other.isZombie) {
        var dir = this.pos.subtract(other.pos).normalize().scale(5);
        this.pos.translate(dir);
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

  Dude.prototype.alive = function () {
    return this.health > 0;
  };

  Dude.prototype.activeFirearm = function () {
    return this.health > 0   &&  // have to be alive
           !this.inside      &&  // have to be outside
           !this.driving     &&  // can't be driving
           !this.pumping;        // can't be pumping gas
  };

  Dude.prototype.distanceFromOrigin = function () {
    // if we're just spawned the driving field could be boolean true
    var sprite = (this.driving && this.driving.isCar) ? this.driving : this;
    return Math.round(sprite.pos.subtract(Game.startPosition).magnitude() / 1584);
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

  Dude.prototype.makeInvulnerable = function () {
    this.invulnerabilityCounter = INVULNERABILITY_TIME;

    // ignore zombies when invulnerable
    this.ignores.Zombie = true;
  };

  // override SpriteModel's die()
  Dude.prototype.die = function () {
    // clean up
    this.teardownEventHandlers();

    SpriteModel.prototype.die.call(this);
  };

  // ** EVENT HANDLERS **

  var gameEventHandlers = {
    'before start': function () {
      // put dude inside if he was inside
      if (this.inside) {
        this.updateGrid(); // otherwise currentNode is null
        if (this.currentNode.entrance) {
          this.enterBuilding(this.currentNode.entrance);
        } else {
          this.inside = false;
        }
      }
    },

    'dude enter/exit': function () {
      this.enterOrExit();
    },

    'dude toggle headlights': function () {
      if (this.driving) {
        this.driving.toggleHeadlights();
      }
    },

    'reload': function () {
      // TODO move this to a better place
      // Firearm base class?
      var ammo;
      var firearm = this.hands.weapon();

      if (firearm && firearm.ammoType) {
        do {
          ammo = this.inventory.findItem(firearm.ammoType);
          if (ammo) {
            firearm.accept(ammo);
            if (!ammo.viable()) {
              this.inventory.removeItem(ammo);
            }
          }
        } while (!firearm.isFull() && ammo);
      }
    },

    'map scroll': function (vec) {
      if (this.aimPoint) {
        this.aimPoint.translate(vec);
      }
    }
  };

  Dude.prototype.setupEventHandlers = function () {
    var self = this;

    _.each(gameEventHandlers, function (handler, key) {
      Game.events.subscribe(key, handler, self);
    });

  };

  Dude.prototype.teardownEventHandlers = function () {
    _.each(gameEventHandlers, function (handler, key) {
      Game.events.unsubscribe(key, handler);
    });
  };

  GameTime.subscribe('target time passed', function () {
    Reporter.dudeDeath("caught in a nuclear blast");
  });

  Collidable(Dude);
  SpriteMarshal(Dude);

  return Dude;

});
