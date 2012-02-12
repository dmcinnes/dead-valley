// Car

define(["Game",
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
        "fx/Audio",
        "fx/Smoke",
        "fx/Explosion"],

        function (Game,
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
                  Audio,
                  Smoke,
                  Explosion) {

  var keyStatus = Game.keyboard.keyStatus;

  var massDensityOfAir = 1.2; // kg/m^3

  var closenessForLightDamage = 8;

  var MAX_PUMMEL_HEALTH = 10;

  // TODO maybe I should just save the config directly
  var Car = function (config) {
    this.init(config.spriteConfig);

    // this.setMass(config.mass);
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

    this.collided        = false;
    this.breaking        = false;
    this.reversing       = false;
    this.stopped         = true;
    this.canSmoke        = true;
    this.accelerating    = false;
    this.driver          = null;
    this.steeringAngle   = 0;
    this.directionVector = new Vector(0);

    this.headlightsPos = {
      left:  this.points[0].add({x:4, y:0}),
      right: this.points[1].add({x:-4, y:0})
    };
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
      name:   config.name || "Car",
      width:  config.cargoSpace.width, 
      height: config.cargoSpace.height,
      touch:  true
    });

    this.node.addClass('car');
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
      if (this.breaking) {
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
        Taillight.render(this, 5, this.breaking);
      }
      if (this.taillights.right) {
        Taillight.render(this, 6, this.breaking);
      }
    }
  };

  Car.prototype.isInRenderRange = function (x, y) {
    return !(x + this.tileWidth  + Headlight.length < 0 ||
             y + this.tileHeight + Headlight.length < 0 ||
             x - this.tileWidth  - Headlight.length > Game.GameWidth ||
             y - this.tileHeight - Headlight.length > Game.GameHeight);
  };

  Car.prototype.setSteering = function (steering) {
    if (steering == 0) this.steeringAngle = 0; // reset
    this.steeringAngle += steering;
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
        Audio.engine1.stopAll();
        Audio.engine1.accelerate.play(function () {
          Audio.engine1.speed.loop();
        });
      }
      // front wheel drive
      this.wheels[0].addTransmissionTorque(throttle * this.engineTorque);
      this.wheels[1].addTransmissionTorque(throttle * this.engineTorque);
      this.stopped = false;
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
            !this.breaking &&
             this.stopped) {
          // reverse
          this.setThrottle(-1);
          this.reversing = true;
          this.consumeFuel(delta);
        } else if (!this.stopped) { // if not already stopped
          this.breaking = true;
          // update direction vector
          this.directionVector.set(this.pos.rot - 90);
          if (this.vel.magnitude() < 10) { // close enough, stop it!
            this.stopped = true;
            this.vel.set(0, 0);
            this.acc.set(0, 0);
            this.vel.rot = 0;
            this.acc.rot = 0;
            _.each(this.wheels, function (wheel) { wheel.stop(); });
          } else {
            this.setBrakes((this.directionVector.dotProduct(this.vel) < 0) ? -1 : 1);
          }
        }
      } else {
        this.breaking  = false;
        this.reversing = false;
      }

      var nowAccelerating = keyStatus.up || (keyStatus.down && !this.breaking);

      if (this.accelerating && !nowAccelerating) {
        Audio.engine1.stopAll();
        Audio.engine1.idle.loop();
      }

      this.accelerating = nowAccelerating;
    }

    if (!this.stopped) {
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
      this.addForce(airResistanceVec, new Vector(0, 0));

      if (this.currentNode && !this.currentNode.isRoad && vel_m_s > 1) {
        this.pos.rot += (Math.random() > 0.5) ? -1 : 1;
        this.addForce(airResistanceVec.scale(4), new Vector(0, 0)); // slow em down too

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
      if (this.hasFuel()) {
        Audio.engine1.start.play(function () {
          Audio.engine1.idle.loop();
        });
      }
      this.pummelHealth = MAX_PUMMEL_HEALTH;
      this.driver = dude;
      Game.events.fireEvent("enter car", this);
      if (Sky.isDark()) {
        this.headlightsOn = true;
      }
      return true;
    }
    return false;
  };

  Car.prototype.leave = function (dude) {
    Audio.engine1.start.stop();
    Audio.engine1.idle.stop();
    this.driver = null;
    this.stopped = false;
    Game.events.fireEvent("leave car", this);
  };

  Car.prototype.takeDamage = function (damage, point, other) {
    if (damage && this.health > 0) {
      this.takingDamage = true;

      this.canSmoke = true;

      this.health -= damage;

      if (point) {
        this.damageLight(point);
      }

      this.fireEvent('health changed', this.health);

      // kick dude out after 10 hits
      if (other && other.isZombie && this.driver) {
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
        this.stopped = true;

        // inventory goes bye-bye
        this.inventory = null;

        // fuel burns up
        this.currentFuel = 0;

        // kick dude out
        if (this.driver) {
          this.driver.leaveCar();
        };

        this.makeHusk();

        var reason = "";
        if (other) {
          if (other.isFirearm) {
            reason = 'shot by ' + other.description;
          } else if (other.clazz === 'BaseballBat') {
            reason = 'smashed with a baseball bat';
          } else if (other.isCar) {
            var runaway = (other.driver) ? '' : 'runaway ';
            reason = 'collided with a ' + runaway + other.color + ' ' + other.name;
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

        Reporter.carDestruction(reason);

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
      if (magnitude > 132) { // 30 MPH
        damage = Math.floor(magnitude / 44); // every 10 MPH
        this.takeDamage(damage, point, other);
      }

      this.stopped = false;
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
      canSmoke:     false, // car stops smoking after it is saved off
      headlights:   this.headlights,
      taillights:   this.taillights,
      headlightsOn: this.headlightsOn,
      mass:         this.mass,
      inertia:      this.inertia,
      stationary:   this.stationary,
      setColor:     this.color
    }
    return _.extend(data, carData);
  };

  Car.prototype.isCar = true;

  Collidable(Car);
  Fuel.receiver(Car);

  return Car;
});
