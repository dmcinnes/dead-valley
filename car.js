// Car

define(["game",
        "rigidbody",
        "wheel",
        "collidable",
        "Sky",
        "Headlight"], function (game, RigidBody, Wheel, collidable, Sky, Headlight) {

  var keyStatus = game.controls.keyStatus;
  var context   = game.spriteContext;

  var massDensityOfAir = 1.2; // kg/m^3

  var Car = function (config) {
    config.name = 'car';
    this.init(config);

    this.setMass(config.mass);
    this.dragArea = config.dragArea;
    this.steeringLock  = config.steeringLock;
    this.engineTorque  = config.engineTorque;
    this.brakeTorque   = config.brakeTorque;

    this.wheels = _(config.wheelPositions).map(function (pos) {
      return new Wheel(pos.x, pos.y, config.wheelRadius, this.mass / 4),
    });

    this.speed = 0.0;
    this.collided = false;
    this.breaking = false;
    this.driver = null;
    this.steeringAngle = 0;

    this.headlights = [
      this.points[0].add({x:4, y:0}),
      this.points[1].add({x:-4, y:0})
    ];
  };
  Car.prototype = new RigidBody();

  Car.prototype.draw = function () {
    if (!this.visible) return;

    if (this.collided) {
      this.collided = false;
      context.fillColor = 'black';
      context.fillRect(this.points[0].x,
                       this.points[0].y,
                       this.tileWidth,
                       this.tileHeight);
    }

    this.drawTile(0);
    this.drawTile(1);

    if (this.driver) {
      if (this.breaking) {
        // break lights
        this.drawTile(4);
        this.drawTile(5);
      }

      if (Sky.isDark()) {
        // headlights
        this.drawTile(2);
        this.drawTile(3);
        Headlight.render(this, this.headlights[0]);
        Headlight.render(this, this.headlights[1]);
      }

      // MPH
      context.fillText(Math.round(this.vel.magnitude() * 14400 / 63360).toString(), 0, 0);
    }

    // _(this.wheels).each(function (wheel) {
    //   context.beginPath();
    //   context.strokeStyle = 'black';
    //   context.lineWidth = 1;
    //   context.moveTo(wheel.position.x, wheel.position.y);
    //   context.lineTo(wheel.position.x + wheel.responseForce.x,
    //                  wheel.position.y + wheel.responseForce.y);
    //   context.stroke();
    //   context.fillText(Math.round(wheel.speed), wheel.position.x, wheel.position.y);
    // });
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
  };

  Car.prototype.setBrakes = function (brakes) {
    var self = this;
    _(this.wheels).each(function (wheel) {
      wheel.addTransmissionTorque(-wheel.speed * self.brakeTorque * brakes);
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

      this.setThrottle((keyStatus.up) ? 1 : 0);

      if (keyStatus.down) {
        if (this.wheels[0].speed > 0 &&
            this.wheels[1].speed > 0) {
          this.setBrakes(1);
          this.breaking = true;
        } else if (!this.breaking) {
          // reverse
          this.setThrottle(-1);
        }
      } else {
        this.breaking = false;
      }
    }

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
  };

  Car.prototype.postMove = function (delta) {
    if (this.driver) {
      game.map.keepInView(this);
    }
  };

  collidable(Car, {
    scenery: true,
    car:     true,
    Dude:    true
  });

  return Car;
});
