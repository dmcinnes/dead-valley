// Car

define(["game", "rigidbody", "matrix"], function (game, RigidBody, Matrix) {

  var keyStatus = game.controls.keyStatus;
  var context   = game.spriteContext;
  var matrix    = new Matrix(2, 3);

  var Wheel = function (posx, posy, radius) {
    this.position = new Vector(posx, posy);
    this.radius   = radius;

    this.speed      = 0.0;

    this.forwardAxis = new Vector(0, 0);
    this.sideAxis    = new Vector(0, 0);
    this.torque      = 0.0;
    this.inertia     = radius * radius; // fake
    // this.inertia     = 2.0; // fake

    //foward vector
    var forwardVector = new Vector(0, -1);
    var sideVector    = new Vector(1,  0);

    this.setSteeringAngle = function (angle) {
      matrix.configure(angle, 1.0, 0, 0);

      matrix.vectorMultiply(forwardVector, this.forwardAxis);
      matrix.vectorMultiply(sideVector, this.sideAxis);
    };

    this.addTransmissionTorque = function (newValue) {
      this.torque += newValue;
    };

    var patchSpeed, diff, sideVel, forwardVel, responseForce;
    this.calculateForce = function (relativeGroundSpeed, delta) {
      // calculate speed of tire patch at ground
      patchSpeed = this.forwardAxis.multiply(this.speed * this.radius);

      // get velocity difference between ground and patch
      diff = relativeGroundSpeed.subtract(patchSpeed);

      // project ground speed onto side and forward axis
      sideVel    = diff.project(this.sideAxis);
      forwardVel = diff.project(this.forwardAxis);

      // calculate super fake friction forces
      // calculate response force
      responseForce = sideVel.multiply(-2.0).subtract(forwardVel);

      // calculate torque on wheel
      this.torque += diff.dotProduct(this.forwardAxis) * radius;

      // integrate total torque into wheel
      this.speed += (this.torque / this.inertia) * delta;

      // if (keyStatus.up || keyStatus.down) {
      //   console.log('----');
      //   console.log('groundSpeed', relativeGroundSpeed.x, relativeGroundSpeed.y);
      //   console.log('patchSpeed', patchSpeed.x, patchSpeed.y);
      //   console.log('diff', diff.x, diff.y);
      //   console.log('sideVel', sideVel.x, sideVel.y);
      //   console.log('forwardVel', forwardVel.x, forwardVel.y);
      //   console.log('torque', this.torque);
      //   console.log('speed', this.speed);
      //   console.log('responseForce', responseForce.x, responseForce.y);
      //   console.log('----');
      // }

      // clear our transmission torque accumulator
      this.torque = 0.0;

      this.responseForce = responseForce;

      // return force acting on body
      return responseForce;
    };

    this.setSteeringAngle(0);
  };

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
    this.engineTorque = 20.0;
    this.brakeTorque  = 4.0;

    this.collidesWith = ['car'];

    var hw = width / 2;
    var hh = height / 2;
    this.wheels = [
      new Wheel(-hw, -hh, 0.5),
      new Wheel( hw, -hh, 0.5),
      new Wheel(-hw,  hh, 0.5),
      new Wheel( hw,  hh, 0.5)
    ];

    this.draw = function () {
      if (!this.visible) return;

      if (this.collided) {
        this.collided = false;
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

      _(this.wheels).each(function (wheel) {
        context.beginPath();
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.moveTo(wheel.position.x, wheel.position.y);
        context.lineTo(wheel.position.x + wheel.responseForce.x,
                       wheel.position.y + wheel.responseForce.y);
        context.stroke();
        context.fillText(Math.round(wheel.speed), wheel.position.x, wheel.position.y);
      });
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

        this.breaking = false;

        this.setThrottle((keyStatus.up) ? 1 : 0);

        if (keyStatus.down) {
          this.setBrakes(1);
          this.breaking = true;
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
      game.map.keepInView(this);
    };

    this.collision = function (other) {
      this.collided = true;
    };

  };
  Car.prototype = new RigidBody();

  return Car;
});
