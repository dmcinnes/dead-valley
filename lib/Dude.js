// The DUDE

define(["Game",
        "Sprite",
        "Collidable",
        "SpriteMarshal",
        "DudeHands",
        "Inventory",
        "Car",
        "Fuel",
        "Sky",
        "Reporter",
        "GameTime",
        "fx/Audio",
        "fx/BloodSplatter"],

       function (Game,
                 Sprite,
                 Collidable,
                 SpriteMarshal,
                 DudeHands,
                 Inventory,
                 Car,
                 Fuel,
                 Sky,
                 Reporter,
                 GameTime,
                 Audio,
                 BloodSplatter) {

  var $container = $('#container');

  var transformKey       = Modernizr.prefixed('transform');
  var transformOriginKey = Modernizr.prefixed('transformOrigin');

  var keyStatus = Game.keyboard.keyStatus;
  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var MAX_HEALTH = 6;

  var SPEED = 48;
  var WALKING_ANIMATION_FRAME_RATE = 0.03; // in seconds
  var DAMAGE_ANIMATION_TIME        = 0.3;  // in seconds
  var FIRING_ANIMATION_TIME        = 0.1;  // in seconds
  var INVULNERABILITY_TIME         = 5;    // in seconds

  var ARM_OFFSET_X    = 5;
  var ARM_OFFSET_Y    = 8;
  var ARM_FLIP_OFFSET = 10;

  var DROP_PICKUP_DISTANCE = 8;

  // preload dude light image
  Game.assetManager.loadImage('dude-light');


  var Dude = function () {
    this.init('Dude');

    this.driving                = null;
    this.inside                 = null;

    this.direction              = RIGHT;
    this.walking                = false;
    this.walkingFrame           = 0;
    this.walkingFrameCounter    = 0;
    this.damageFrameCounter     = 0;
    this.firingFrameCounter     = 0;
    this.invulnerabilityCounter = 0;

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

    this.aimingArmNode          = this.createNode(1, 200);
    // set the transform origin so it rotates in the right place
    this.aimingArmNode[0].style[transformOriginKey] = ARM_OFFSET_X + 'px ' + ARM_OFFSET_Y + 'px';

    this.setupEventHandlers();
    this.setupMouseBindings();

    Game.assetManager.loadImage('dude-light', $.proxy(function (img) {
      this.lightImage = img;
    }, this));
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
    } else {
      // reusing the walkingFrameCounter
      if (this.walkingFrameCounter < 0.6) {
        this.walkingFrameCounter += delta;
        this.drawTile(14, 0);
      } else {
        this.drawTile(15, 0);
      }
    }

    this.drawArms();
  };

  Dude.prototype.render = function (delta) {
    Sprite.prototype.render.call(this, delta);

    var context = Game.skyContext;
    var map = Game.map;

    // render night silhouette
    if (this.takingDamage && this.imageData) {
      context.save();
      context.translate(this.pos.x - map.originOffsetX - this.center.x,
                        this.pos.y - map.originOffsetY - this.center.y);
      if (this.direction === LEFT) {
        context.translate(20, 0);
        context.scale(-1, 1);
      }

      context.globalCompositeOperation = 'source-over';
      this.renderToContext(context);
      context.globalCompositeOperation = 'lighter';
      this.renderToContext(context);

      context.restore();

      Sky.dirty = true;
    }

    if (this.lightImage && Sky.isDark()) {
      context.save();

      context.translate(this.pos.x - map.originOffsetX - this.lightImage.width/2,
                        this.pos.y - map.originOffsetY - this.lightImage.height/2);

      // center the light source a bit better
      if (this.direction === LEFT) {
        context.translate(-2, -2);
      } else {
        context.translate(-3, -2);
      }

      context.globalCompositeOperation = 'destination-out';
      context.drawImage(this.lightImage, 0, 0);

      context.restore();
    }

    // blink!
    if (this.invulnerabilityCounter > 0) {
      var time = this.invulnerabilityCounter + Math.PI;
      var test = Math.cos(3*time*time);
      this.node[0].style.visibility = (test > 0) ? 'visible' : 'hidden';
    }
    if (this.invulnerabilityCounter === 0) {
      // need to make sure visibility is turned back on
      this.node[0].style.visibility = 'visible';
      this.invulnerabilityCounter = -1;
    }
  };

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
        this.vel.x = -1;
        this.direction = LEFT;
      } else if (keyStatus.right) {
        this.vel.x = 1;
        this.direction = RIGHT;
      }
      if (keyStatus.up) {
        this.vel.y = -1;
      } else if (keyStatus.down) {
        this.vel.y = 1;
      }
      this.vel.normalize().scale(SPEED);
    }

    if (this.walking) {
      this.aimTowardMouse(this.aimPoint, false); // update so flashlight follows
      this.aiming = false;
    }

    if (this.invulnerabilityCounter > 0) {
      this.invulnerabilityCounter -= delta;
      if (this.invulnerabilityCounter <= 0) {
        this.invulnerabilityCounter = 0;
        // remove the zombie filter
        this.ignores.Zombie = false;
      }
    }

    Reporter.walkedDistance(this.vel.magnitude() * delta);

    Game.map.keepInView(this);
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

    if (other.isInventorySprite) {
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
    Sprite.prototype.hide.call(this); // super
    this.aimingArmNode[0].style.visibility = 'hidden';
    if (this.currentNode) {
      this.currentNode.leave(this);
      this.currentNode = null;
    }
    Sky.dirty = true;
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

  Dude.prototype.aimTowardMouse = function (coords, setDirection) {
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
    var metadata = Sprite.prototype.saveMetadata.call(this);
    metadata.health    = this.health;
    metadata.inventory = this.inventory.saveMetadata();
    metadata.hands     = this.hands.saveMetadata();
    metadata.driving   = !!this.driving;
    metadata.inside    = !!this.inside;
    if (this.driving) {
      metadata.pos = this.driving.pos.clone().round();
      metadata.pos.retain();
    }
    return metadata;
  };

  Dude.prototype.takeDamage = function (damage, point, other, collision) {
    if (this.alive() &&
        damage > 0 &&
        this.invulnerabilityCounter <= 0) {

      this.takingDamage = true;

      Audio.dude.hit.play();

      BloodSplatter.splat(this.pos.clone(), '#900', damage);

      this.health -= damage;

      this.fireEvent('health changed', this.health);

      if (this.health <= 0) {
        // die
        this.Collidable = false;

        // reset the frame counter
        this.walkingFrameCounter = 0;

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

  Dude.prototype.drawArms = function () {
    this.aimingArmNode[0].style.visibility = 'hidden';
    if (this.alive()) {
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
    }
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

    var transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'rad)';

    if (this.direction) {
      transform += ' scaleX(-1)';
    }

    if (Game.threeDee) {
      transform += ' translateZ(' + (this.z + 1) + 'px)';
    } else {
      style.zIndex = this.z + 1;
    }

    var left = -(frame * this.tileWidth) - this.imageOffset.x;
    var top  = -this.imageOffset.y;

    style[transformKey] = transform;

    style.backgroundPosition = left + 'px ' + top + 'px';

    style.visibility = 'visible';
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
    var sprite = this.driving || this;
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

  // override Sprite's die()
  Dude.prototype.die = function () {
    // clean up
    this.teardownEventHandlers();
    this.teardownMouseBindings();

    Sprite.prototype.die.call(this);
  };

  // ** EVENT HANDLERS **

  var gameEventHandlers = {
    'before start': function () {
      // put dude in the car if he was driving
      if (this.driving) {
        var self = this;
        var car = _.detect(Game.sprites, function (sprite) {
          return sprite.isCar && sprite.pos.equals(self.pos);
        });
        if (car) {
          this.enterCar(car);
          // so he'll get out on the driver's side
          this.moved = true;
        } else {
          this.driving = false;
        }
      }
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
    },

    'mousedown': function (event, clickedSprite) {
      if (this.alive()) {

        // TODO maybe a better place for this
        var pump = Fuel.activePump;
        if (pump) {

          if (clickedSprite &&
              clickedSprite.isCar &&
              clickedSprite.health > 0 &&
              pump.isCarCloseEnough &&
              pump.isCarCloseEnough(clickedSprite)) {
            pump.startFueling(clickedSprite);
            this.pumping = true;
          }
        }
      }
    },

    'click': function (event, clickedSprite) {
      if (this.activeFirearm()) {

        var firearm = this.hands.weapon();
        if (firearm) {
          var coords = Game.map.worldCoordinatesFromWindow(event.pageX, event.pageY);

          if (firearm.aimable) {
            this.aimTowardMouse(coords, true);
          }

          var muzzle = coords.subtract(this.pos).normalize().scale(5);

          if (firearm.fire(this.pos.add(muzzle), coords, this.direction)) {
            this.firing = true;
          }
        }
      }
      // click is completed, we can't be pumping anymore
      this.pumping = false;
    },

    'space': function () {
      var firearm = this.hands.weapon();
      if (firearm &&
          firearm.isMeleeWeapon &&
          firearm.fire(this.pos, this.pos, this.direction)) {
        this.firing = true;
      }
    }
  };

  var skyEventHandlers = {
    'sunrise': function () {
      if (this.driving) {
        this.driving.headlightsOn = false;
      }
    },
    'sunset': function () {
      if (this.driving) {
        this.driving.headlightsOn = true;
      }
    }
  };

  var mouseEventHandlers = {
    mousemove: function (e) {
      var dude = e.data;
      if (dude.alive()) {
        var coords = Game.map.worldCoordinatesFromWindow(e.pageX, e.pageY);
        dude.aimTowardMouse(coords, true);
      }
    },
    mouseleave: function (e) {
      var dude = e.data;
      dude.aiming       = false;
      dude.aimDirection = null;
      dude.aimPoint     = null;
    }
  };

  Dude.prototype.setupEventHandlers = function () {
    var self = this;

    _.each(gameEventHandlers, function (handler, key) {
      Game.events.subscribe(key, handler, self);
    });

    _.each(skyEventHandlers, function (handler, key) {
      Sky.subscribe(key, handler, self);
    });
  };

  Dude.prototype.setupMouseBindings = function () {
    var self = this;
    var $bindee = $('#canvas-mask');

    _.each(mouseEventHandlers, function (handler, key) {
      $bindee.bind(key, self, handler);
    });
  };

  Dude.prototype.teardownEventHandlers = function () {
    _.each(gameEventHandlers, function (handler, key) {
      Game.events.unsubscribe(key, handler);
    });

    _.each(skyEventHandlers, function (handler, key) {
      Sky.unsubscribe(key, handler);
    });
  };

  Dude.prototype.teardownMouseBindings = function () {
    var $bindee = $('#canvas-mask');

    _.each(mouseEventHandlers, function (handler, key) {
      $bindee.unbind(key, handler);
    });
  };

  GameTime.subscribe('target time passed', function () {
    Reporter.dudeDeath("caught in a nuclear blast");
  });

  Collidable(Dude);
  SpriteMarshal(Dude);

  return Dude;

});
