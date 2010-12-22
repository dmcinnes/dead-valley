// Car

define(["game", "rigidbody", "wheel"], function (game, RigidBody, Wheel) {

  var keyStatus = game.controls.keyStatus;
  var context   = game.spriteContext;

  var Car = function (name, width, height, image) {
    var rad, rot, i;

    this.init(name, width, height, image);
    this.setMass(5.0); // units?
    // this.setMass(1200); // kg

    this.speed = 0.0;

    this.collided = false;

    this.breaking = false;
    this.driver = null;

    this.steeringLock = 43.0; // degrees
    this.engineTorque = 60.0;
    this.brakeTorque  = 5.0;

    this.collidesWith = ['car'];

    var hw = width / 2;
    var hh = height / 2;
    this.wheels = [
      new Wheel(-hw+2, -hh+8, 0.5),
      new Wheel( hw-2, -hh+8, 0.5),
      new Wheel(-hw+2,  hh-8, 0.5),
      new Wheel( hw-2,  hh-8, 0.5)
    ];

    this.draw = function () {
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
      if (this.breaking) {
        this.drawTile(4);
        this.drawTile(5);
      }

      // MPH
      if (this.driver) {
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

    this.setSteering = function (steering) {
      // apply steering angle to front wheels
      this.wheels[0].setSteeringAngle(steering * this.steeringLock);
      this.wheels[1].setSteeringAngle(steering * this.steeringLock);
    };

    this.setThrottle = function (throttle) {
      // front wheel drive
      this.wheels[0].addTransmissionTorque(throttle * this.engineTorque);
      this.wheels[1].addTransmissionTorque(throttle * this.engineTorque);
    };

    this.setBrakes = function (brakes) {
      var self = this;
      _(this.wheels).each(function (wheel) {
        wheel.addTransmissionTorque(-wheel.speed * self.brakeTorque * brakes);
      });
    };

    this.preMove = function (delta) {
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
      for (i = 0; i < 4; i++) {
        worldWheelOffset = this.relativeToWorld(this.wheels[i].position);
        // console.log(this.wheels[i].position.x, this.wheels[i].position.y, worldWheelOffset.x, worldWheelOffset.y);
        worldGroundVel = this.pointVel(worldWheelOffset);
        relativeGroundSpeed = this.worldToRelative(worldGroundVel);
        relativeResponseForce = this.wheels[i].calculateForce(relativeGroundSpeed, delta);
        worldResponseForce = this.relativeToWorld(relativeResponseForce);

        this.addForce(worldResponseForce, worldWheelOffset);
      }
    };

    this.postMove = function (delta) {
      if (this.driver) {
        game.map.keepInView(this);
      }
    };
  };
  Car.prototype = new RigidBody();

  return Car;
});
