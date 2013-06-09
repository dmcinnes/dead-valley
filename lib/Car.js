// Car

define(["Game",
        "car-list",
        "sprite-info",
        "Vector",
        "RigidBody",
        "Sprite",
        "Wheel",
        "Collidable",
        "Sky",
        "Headlight",
        "Taillight",
        "Inventory",
        "Fuel",
        "Reporter",
        "sprites/Zombie",
        "fx/Audio",
        "fx/Smoke",
        "fx/Explosion"],

        function (Game,
                  carList,
                  spriteInfo,
                  Vector,
                  RigidBody,
                  Sprite,
                  Wheel,
                  Collidable,
                  Sky,
                  Headlight,
                  Taillight,
                  Inventory,
                  Fuel,
                  Reporter,
                  Zombie,
                  Audio,
                  Smoke,
                  Explosion) {

  var keyStatus = Game.keyboard.keyStatus;

  var massDensityOfAir = 1.2; // kg/m^3

  var closenessForLightDamage = 8;

  var MAX_PUMMEL_HEALTH = 10;
  var ZOMBIE_PUSHBACK   = 25;

  var DEFAULT_Z_INDEX = 300;

  // TODO maybe I should just save the config directly
  var Car = function (config) {
    this.init(config.spriteConfig);

    this.mass          = config.mass;
    this.dragArea      = config.dragArea;
    this.steeringLock  = config.steeringLock;
    this.engineTorque  = config.engineTorque;
    this.brakeTorque   = config.brakeTorque;

    this.wheels = _(config.wheelPositions).map(function (pos) {
      return new Wheel(pos.x, pos.y, config.wheelRadius, this.mass / 4);
    });

    this.driversSide      = config.driversSide;
    this.passengersSide   = config.driversSide.clone();
    this.passengersSide.x = -this.passengersSide.x; // assuming we're symmetrical
    this.driversSide.retain();
    this.passengersSide.retain();

    this.collided        = false;
    this.braking         = false;
    this.reversing       = false;
    this.stationary      = true;
    this.canSmoke        = false;
    this.accelerating    = false;
    this.driver          = null;
    this.steeringAngle   = 0;
    this.directionVector = Vector.create(0);
    this.directionVector.retain();

    this.headlightsPos = {
      left:  this.points[0].add({x:4, y:0}),
      right: this.points[1].add({x:-4, y:0})
    };
    this.headlightsPos.left.retain();
    this.headlightsPos.right.retain();

    this.headlights = {
      left:  true,
      right: true
    };
    this.taillights = {
      left:  true,
      right: true
    };
    this.headlightsOn = false;

    this.fuelCapacity    = config.fuelCapacity;

    // 60 mph / (60 min/hr * 60 sec/min) = mi/sec
    // mi/sec / mi/gal = gal/sec
    this.fuelConsumption = (1 / 60) / config.mpg; // gal/sec
    this.fuelConsumption *= 20; // scale it up for the Game

    this.currentFuel = 0;

    this.health = 100;

    this.pummelHealth = MAX_PUMMEL_HEALTH;

    this.smokeCounter = 0;

    this.roughRoadCounter = 0;

    this.inventory = new Inventory({
      name:   this.name || "Car",
      width:  config.cargoSpace.width, 
      height: config.cargoSpace.height,
      touch:  true
    });

    this.node.addClass('car');

    this.z = DEFAULT_Z_INDEX;

    this.zombies = 0;

    this.subscribe('fuel level updated', function (consumption) {
      if (this.currentFuel === 0) {
        // out of fuel
        Audio.engine1.stopAll();
      }
    });
  };
  Car.prototype = new RigidBody();

  Car.prototype.draw = function () {
    if (!this.visible || !this.imageData) {
      return;
    }

    // dead!
    if (this.health <= 0) {
      this.drawTile(2);
      return;
    }

    if (this.health > 25) {
      this.drawTile(0);
    } else {
      this.drawTile(1);
    }

    if (this.driver) {
      if (this.braking) {
        // break lights
        if (this.taillights.left) {
          this.drawTile(5);
        }
        if (this.taillights.right) {
          this.drawTile(6);
        }
      }
    }

    // headlights
    if (this.headlightsOn) {
      if (this.headlights.left) {
        this.drawTile(3);
        Headlight.render(this, this.headlightsPos.left);
      }
      if (this.headlights.right) {
        this.drawTile(4);
        Headlight.render(this, this.headlightsPos.right);
      }
      if (this.taillights.left) {
        Taillight.render(this, 5, this.braking);
      }
      if (this.taillights.right) {
        Taillight.render(this, 6, this.braking);
      }
    }
  };

  Car.prototype.isInRenderRange = function () {
    var x = this.pos.x - Game.map.originOffsetX;
    var y = this.pos.y - Game.map.originOffsetY;

    return !(x + this.tileWidth  + Headlight.length < 0 ||
             y + this.tileHeight + Headlight.length < 0 ||
             x - this.tileWidth  - Headlight.length > Game.GameWidth ||
             y - this.tileHeight - Headlight.length > Game.GameHeight);
  };

  Car.prototype.setSteering = function (steering) {
    if (steering === 0) this.steeringAngle = 0; // reset
    this.steeringAngle += steering * 0.7; // calm down oversteer
    if (Math.abs(this.steeringAngle) > this.steeringLock) {
      this.steeringAngle = this.steeringLock * steering;
    }
    // apply steering angle to front wheels
    this.wheels[0].setSteeringAngle(this.steeringAngle);
    this.wheels[1].setSteeringAngle(this.steeringAngle);
  };

  Car.prototype.setThrottle = function (throttle) {
    // gotta have fuel to drive
    if (this.health > 0 && this.currentFuel > 0) {
      if (!this.accelerating) {
        Audio.engine1.accelerate.play(function () {
          Audio.engine1.speed.loop();
        });
        Audio.engine1.slow.stop();
        Audio.engine1.idle.stop();
      }
      // front wheel drive
      this.wheels[0].addTransmissionTorque(throttle * this.engineTorque);
      this.wheels[1].addTransmissionTorque(throttle * this.engineTorque);
      this.stationary = false;
    }
  };

  Car.prototype.setBrakes = function (brakes) {
    var torque = this.brakeTorque * brakes;
    _(this.wheels).each(function (wheel) {
      wheel.applyBrakes(torque);
    });
  };

  Car.prototype.preMove = function (delta) {
    if (!this.visible) return;

    if (this.driver) {
      if (keyStatus.left || keyStatus.right) {
        this.setSteering(keyStatus.right ? 1 : -1);
      } else {
        this.setSteering(0);
      }

      if (keyStatus.up) {
        this.setThrottle(1);
        this.consumeFuel(delta);
      }

      if (keyStatus.down) {
        if ( this.reversing ||
            !this.braking &&
             this.stationary) {
          // reverse
          this.setThrottle(-1);
          this.reversing = true;
          this.consumeFuel(delta);
        } else if (!this.stationary) { // if not already stationary
          this.braking = true;
          // update direction vector
          this.directionVector.set(this.pos.rot - 90);
          if (this.vel.magnitude() < 20) { // close enough, stop it!
            this.stop();
          } else {
            this.setBrakes((this.directionVector.dotProduct(this.vel) < 0) ? -1 : 1);
          }
        }
      } else {
        this.braking   = false;
        this.reversing = false;
      }

      var nowAccelerating = keyStatus.up || (keyStatus.down && !this.braking);

      if (this.accelerating &&
         !nowAccelerating &&
          this.currentFuel > 0) {
        Audio.engine1.slow.play(function () {
          Audio.engine1.idle.loop();
        });
        Audio.engine1.accelerate.stop();
        Audio.engine1.speed.stop();
      }

      this.accelerating = nowAccelerating;
    }

    if (!this.stationary) {
      var worldWheelOffset,
          worldGroundVel,
          relativeGroundSpeed,
          relativeResponseForce,
          worldResponseForce;
      for (var i = 0; i < 4; i++) {
        worldWheelOffset = this.relativeToWorld(this.wheels[i].position);
        // console.log(this.wheels[i].position.x, this.wheels[i].position.y, worldWheelOffset.x, worldWheelOffset.y);
        worldGroundVel = this.pointVel(worldWheelOffset);
        relativeGroundSpeed = this.worldToRelative(worldGroundVel);
        relativeResponseForce = this.wheels[i].calculateForce(relativeGroundSpeed, delta);
        worldResponseForce = this.relativeToWorld(relativeResponseForce);

        this.addForce(worldResponseForce, worldWheelOffset);
      }

      var vel_m_s = this.vel.magnitude() / 10; // 10 pixels per meter
      var airResistance = Math.round(-0.5 * massDensityOfAir * this.dragArea * Math.pow(vel_m_s, 2));
      var airResistanceVec = this.vel.clone().normalize().scale(airResistance);
      this.addForce(airResistanceVec, Vector.create(0, 0));

      if (!this.driver) {
        this.addForce(airResistanceVec.scale(16), Vector.create(0, 0)); // slow em down even more
      }

      if (this.currentNode && !this.currentNode.isRoad && vel_m_s > 1) {
        this.pos.rot += (Math.random() > 0.5) ? -1 : 1;
        this.addForce(airResistanceVec.scale(4), Vector.create(0, 0)); // slow em down too

        if (Math.floor(this.roughRoadCounter + delta) > Math.floor(this.roughRoadCounter)) {
          // damage car on rough road
          this.takeDamage(1, this.pos, 'off-road');
        }
        this.roughRoadCounter += delta;
      }
    }
  };

  Car.prototype.postMove = function (delta) {
    if (this.driver) {
      Game.map.keepInView(this);

      if (!this.driver.moved && this.vel.magnitude() > 0) {
        this.driver.moved = true;
      }

      Reporter.droveDistance(this.vel.magnitude() * delta);
    }

    if (this.canSmoke && this.health < 25) {
      this.smokeCounter += delta;
      // the more damaged the more smoke it emits
      var threshold = this.health / 2;
      threshold = (threshold < 0.5) ? 0.5 : threshold;
      if (this.smokeCounter > threshold) {
        this.smokeCounter = 0;
        // make smoke come out of the engine
        Smoke.createNew(this.pos.add(this.directionVector.multiply(this.tileHeight / 3)));
      }
    }

    // make 'stationary' if moving slow enough
    if (!this.accelerating &&
        this.acc.magnitude() < 10 &&
        Math.abs(this.acc.rot) < 1 &&
        this.vel.magnitude() < 10) {
      this.stationary = true;
      this.vel.scale(0);
      this.vel.rot = 0;
    }
  };

  // stop it
  Car.prototype.stop = function () {
    this.stationary = true;
    this.vel.set(0, 0);
    this.acc.set(0, 0);
    this.vel.rot = 0;
    this.acc.rot = 0;
    _.each(this.wheels, function (wheel) { wheel.stop(); });
  };

  Car.prototype.toggleHeadlights = function () {
    this.headlightsOn = !this.headlightsOn;
  };

  Car.prototype.driversSideLocation = function () {
    return this.pos.add(this.relativeToWorld(this.driversSide));
  };

  Car.prototype.passengersSideLocation = function () {
    return this.pos.add(this.relativeToWorld(this.passengersSide));
  };

  Car.prototype.enter = function (dude) {
    // can't enter if it's destroyed
    if (this.health > 0) {

      if (this.zombies > 0) {

        while (this.zombies > 0) {
          this.zombies--;
          var zombie = new Zombie();
          zombie.pos.set(dude.pos);
          var extra = Vector.create(Math.random() * 360);
          zombie.pos.translate(extra.scale(5));
          Game.addSprite(zombie);
        }

        var push = dude.pos.subtract(this.pos).normalize().scale(ZOMBIE_PUSHBACK);
        dude.pos.translate(push);
      } else {
        if (this.hasFuel()) {
          Audio.engine1.idle.loop();
        }
        this.pummelHealth = MAX_PUMMEL_HEALTH;
        this.driver = dude;
        Game.events.fireEvent("enter car", this);
        if (Sky.isDark()) {
          this.headlightsOn = true;
        }
        return true;
      }
    }
    return false;
  };

  Car.prototype.leave = function (dude) {
    // stop the car if driver was trying to stop it and it's
    // close enough
    if ((this.vel.magnitude() < 30) ||
        (this.vel.add(this.acc).dotProduct(this.vel) < 0)) {
      this.stop();
    }
    Audio.engine1.stopAll();
    this.driver = null;
    Game.events.fireEvent("leave car", this);
  };

  Car.prototype.takeDamage = function (damage, point, other, collision) {
    if (damage && this.health > 0) {
      this.takingDamage = true;

      this.canSmoke = true;

      this.health -= damage;

      if (point) {
        this.damageLight(point);
      }

      this.fireEvent('health changed', this.health);

      // kick dude out after 10 hits
      if (other && other.isZombie && this.driver && !collision) {
        this.pummelHealth -= damage;
        if (this.pummelHealth <= 0) {
          // kick dude out
          this.driver.leaveCar();
        }
      }

      if (this.health <= 0) {
        // die!

        // stop moving
        this.vel.scale(0);
        this.vel.rot = 0;
        this.stationary = true;

        // inventory goes bye-bye
        this.inventory = null;

        // fuel burns up
        this.currentFuel = 0;

        // kick dude out
        if (this.driver) {
          this.driver.leaveCar();
        }

        this.makeHusk();

        var reason = "";
        if (other) {
          if (other.isFirearm) {
            reason = 'shot by ' + other.description;
          } else if (other.clazz === 'BaseballBat') {
            reason = 'smashed with a baseball bat';
          } else if (other.isCar) {
            var color = other.color || '';
            reason = 'collided with a ' + color + ' ' + other.name;
          } else if (other.name === 'Barrel') {
            reason = 'banged up by a rolling barrel';
          } else if (other.name === 'Explosion') {
            if (other.originObject) {
              reason = 'blown away by an exploding ' + other.originObject.name;
            } else {
              reason = 'exploded';
            }
          } else if (other.isZombie) {
            reason = 'destroyed by a zombie';
          } else if (other.isDude) {
            reason = 'destroyed in a collision with you';
          } else if (other === 'off-road') {
            reason = 'destroyed by rough terrain';
          } else {
            reason = 'collided with a ' + (other.description || other.name);
          }
        } else if (damage === 999) {
          reason = 'utterly destroyed by supernatural forces (cheater!)';
        }

        if (!reason) {
          reason = 'destroyed by unknown causes!';
        }

        Reporter.carDestruction(this.name + ' ' + reason);

        // EXPLOOOODE!
        Explosion.createNew(this.pos, this);
      }
    }
  };

  Car.prototype.collision = function (other, point, normal, vab) {
    if (this.health > 0) {

      var n = normal.clone().normalize();

      // damage the car
      var magnitude = Math.abs(n.dotProduct(vab));
      var damage = 0;
      if (magnitude > 66) { // 15 MPH
        Audio.hit.playRandom();
      }
      if (magnitude > 132) { // 30 MPH
        Audio.crash.playRandom();
        damage = Math.floor(magnitude / 44); // every 10 MPH
        this.takeDamage(damage, point, other, true);
      }

      this.stationary = false;
    }
  };

  Car.prototype.damageLight = function (point) {
    // 50% chance of light damage
    if (Math.random() < 0.5) {
      return;
    }
    var points = this.transformedPoints();
    if (point.subtract(points[0]).magnitude() < closenessForLightDamage) {
      this.headlights.left = false;
    } else if (point.subtract(points[1]).magnitude() < closenessForLightDamage) {
      this.headlights.right = false;
    } else if (point.subtract(points[2]).magnitude() < closenessForLightDamage) {
      this.taillights.right = false;
    } else if (point.subtract(points[3]).magnitude() < closenessForLightDamage) {
      this.taillights.left = false;
    }
  };

  Car.prototype.bulletHit = function (hit, damage, firearm) {
    Sprite.prototype.bulletHit.call(this, hit, damage);
    this.takeDamage(damage, hit.point, firearm);
  };

  Car.prototype.setFuelPercentage = function (percent) {
    this.currentFuel = percent * this.fuelCapacity;
  };

  Car.prototype.makeHusk = function () {
    this.health     = -1;
    this.stationary = true;
    this.inventory  = null;
    this.mass       = Number.MAX_VALUE;
    this.inertia    = 100000;
  };

  Car.prototype.saveMetadata = function () {
    var data = Sprite.prototype.saveMetadata.call(this);
    var carData = {
      inventory:    this.inventory && this.inventory.saveMetadata(),
      currentFuel:  this.currentFuel,
      health:       this.health,
      headlights:   this.headlights,
      taillights:   this.taillights,
      headlightsOn: this.headlightsOn,
      setColor:     this.color,
      zombies:      this.zombies
    };
    if (this.health < 0) {
      carData.makeHusk = true;
    }
    return _.extend(data, carData);
  };

  Car.prototype.glow = function () {
    // increasing the z-index so it will render on top of the darkened sky
    this.z = 550;
    this.node.addClass('glow');
  };

  Car.prototype.stopGlowing = function () {
    this.z = DEFAULT_Z_INDEX;
    this.node.removeClass('glow');
  };

  Car.prototype.isCar = true;

  Collidable(Car);
  Fuel.receiver(Car);

  // preload car images
  _.each(carList, function (car) {
    _.each(car.colors, function (color) {
      var img = spriteInfo[car.name].img + '-' + color;
      Game.assetManager.loadImage(img);
    });
  });

  $('#sprites').on('mouseover', '.car', function () {
    var $car = $(this);
    var id = $car.data('sprite-id');
    var sprite = Game.getSpriteByID(id);
    if (sprite &&
        Fuel.activePump &&
        Fuel.activePump.isCarCloseEnough(sprite)) {
      sprite.glow();
    }
  }).on('mouseout', '.car', function () {
    var $car = $(this);
    if ($car.hasClass('glow')) {
      var id = $car.data('sprite-id');
      var sprite = Game.getSpriteByID(id);
      sprite.stopGlowing();
    }
  });

  Game.events.subscribe('fuel source inactive', function () {
    var $car = $('#sprites .car.glow');
    if ($car.length) {
      var id = $car.data('sprite-id');
      var sprite = Game.getSpriteByID(id);
      sprite.stopGlowing();
    }
  });

  return Car;
});
