// Car

define(["game",
        "rigidbody",
        "wheel",
        "collidable",
        "Sky",
        "Headlight",
        "Taillight",
        "Inventory"],

        function (game,
                  RigidBody,
                  Wheel,
                  collidable,
                  Sky,
                  Headlight,
                  Taillight,
                  Inventory) {

  var keyStatus = game.keyboard.keyStatus;
  var context   = game.spriteContext;

  var massDensityOfAir = 1.2; // kg/m^3

  // TODO maybe I should just save the config directly
  var Car = function (config) {
    this.init(config.name);

    this.setMass(config.mass);
    this.dragArea      = config.dragArea;
    this.steeringLock  = config.steeringLock;
    this.engineTorque  = config.engineTorque;
    this.brakeTorque   = config.brakeTorque;

    this.wheels = _(config.wheelPositions).map(function (pos) {
      return new Wheel(pos.x, pos.y, config.wheelRadius, this.mass / 4);
    });

    this.driversSide    = config.driversSide;
    this.passengersSide = config.driversSide.multiply({x:-1, y:1}); // assuming we're symmetrical

    this.collided      = false;
    this.breaking      = false;
    this.reversing     = false;
    this.stopped       = false;
    this.driver        = null;
    this.steeringAngle = 0;
    this.direction     = new Vector(0);

    this.headlights = [
      this.points[0].add({x:4, y:0}),
      this.points[1].add({x:-4, y:0})
    ];
    this.headlightsOn = false;

    this.inventory = new Inventory(config.cargoSpace.width, config.cargoSpace.height, true);
  };
  Car.prototype = new RigidBody();

  Car.prototype.draw = function () {
    if (!this.visible) return;

    this.drawTile(0);
    this.drawTile(1);

    if (this.driver) {
      if (this.breaking) {
        // break lights
        this.drawTile(4);
        this.drawTile(5);
      }
    }

    if (this.headlightsOn) {
      // headlights
      this.drawTile(2);
      this.drawTile(3);
      Headlight.render(this, this.headlights[0]);
      Headlight.render(this, this.headlights[1]);
      Taillight.render(this, 4, this.breaking);
      Taillight.render(this, 5, this.breaking);
    }
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
    // front wheel drive
    this.wheels[0].addTransmissionTorque(throttle * this.engineTorque);
    this.wheels[1].addTransmissionTorque(throttle * this.engineTorque);
    this.stopped = false;
  };

  Car.prototype.setBrakes = function (brakes) {
    var torque = this.brakeTorque;
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
      }

      if (keyStatus.down) {
        if ( this.reversing ||
            !this.breaking &&
             this.stopped) {
          // reverse
          this.setThrottle(-1);
          this.reversing = true;
        } else if (!this.stopped) { // if not already stopped
          this.breaking = true;
          // update direction vector
          this.direction.set(this.pos.rot - 90);
          if (this.direction.dotProduct(this.vel) < 0) { // reversing
            this.stopped = true;
            this.vel.set(0, 0);
            this.acc.set(0, 0);
            this.vel.rot = 0;
            this.acc.rot = 0;
            _.each(this.wheels, function (wheel) { wheel.stop(); });
          } else {
            this.setBrakes(1);
          }
        }
      } else {
        this.breaking  = false;
        this.reversing = false;
      }
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

      if (this.currentNode && !this.currentNode.isRoad() && vel_m_s > 1) {
        this.pos.rot += (Math.random() > 0.5) ? -1 : 1;
        this.addForce(airResistanceVec.scale(4), new Vector(0, 0)); // slow em down too
      }
    }
  };

  Car.prototype.postMove = function (delta) {
    if (this.driver) {
      game.map.keepInView(this);
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
    this.driver = dude;
    this.shouldSave = false; // disable car saving -- save with Dude object
    game.events.fireEvent("enter car", this);
  };

  Car.prototype.leave = function (dude) {
    this.driver = null;
    this.stopped = false;
    this.shouldSave = true; // reenable car saving
    game.events.fireEvent("leave car", this);
  };

  Car.prototype.takeDamage = function (damage) {
  };

  Car.prototype.isCar = true;

  collidable(Car);

  return Car;
});
