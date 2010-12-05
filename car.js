// Car

define(["game", "rigidbody", "matrix"], function (game, RigidBody, Matrix) {

  var keyStatus = game.controls.keyStatus;
  var context   = game.spriteContext;
  var matrix    = new Matrix(2, 3);

  var Wheel = function (posx, posy, radius) {
    this.position = new Vector(posx, posy);

    this.speed      = 0.0;

    var forwardAxis = new Vector(0, 0);
    var sideAxis    = new Vector(0, 0);
    var torque      = 0.0;
    var inertia     = 1.0; // so no divide by zero

    //foward vector
    var forwardVector = new Vector(0, -1);
    var sideVector    = new Vector(1,  0);

    this.setSteeringAngle = function (angle) {
      matrix.configure(angle, 1.0, 0, 0);

      matrix.vectorMultiply(forwardVector, forwardAxis); 
      matrix.vectorMultiply(sideVector, sideAxis); 
    };

    this.addTransmissionTorque = function (newValue) {
      torque += newValue;
    };

    var patchSpeed, diff, sideVel, forwardVel, responseForce;
    this.calculateForce = function (relativeGroundSpeed, delta) {
      // calculate speed of tire patch at ground
      patchSpeed = forwardAxis.multiply(this.speed * radius);

      // get velocity difference between ground and patch
      diff = relativeGroundSpeed.subtract(patchSpeed);

      // project ground speed onto side axis
      sideVel    = diff.project(sideAxis);
      forwardVel = diff.project(forwardAxis);

      // calculate super fake friction forces
      // calculate response force
      responseForce = sideVel.multiply(-2.0).subtract(forwardVel);

      // calculate torque on wheel
      torque += forwardVel.magnitude() * radius;

      // integrate total torque into wheel
      this.speed += torque / inertia * delta;

      // if (keyStatus.up || keyStatus.down) {
      //   console.log('----');
      //   console.log('patchSpeed', patchSpeed.x, patchSpeed.y);
      //   console.log('diff', diff.x, diff.y);
      //   console.log('sideVel', sideVel.x, sideVel.y);
      //   console.log('forwardVel', forwardVel.x, forwardVel.y);
      //   console.log('torque', torque);
      //   console.log('speed', this.speed);
      //   console.log('responseForce', responseForce.x, responseForce.y);
      //   console.log('----');
      // }

      // clear our transmission torque accumulator
      torque = 0.0;

      // return force acting on body
      return responseForce;
    };

    this.setSteeringAngle(0);
  };

  var Car = function (name, width, height, image) {
    var rad, rot, i;

    this.init(name, width, height, image);
    this.setMass(5.0); // units?

    this.speed = 0.0;

    this.collided = false;

    this.breaking = false;
    this.driver = null;

    this.steeringLock = 0.75;
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
    }

    this.preMove = function (delta) {
      if (!this.visible) return;

      if (this.driver) {
        if (keyStatus.left || keyStatus.right) {
          this.setSteering(keyStatus.left ? 1 : -1);
        } else {
          this.setSteering(0);
        }

        this.breaking = false;

        if (keyStatus.up) {
          this.setThrottle(1);
        } else if (keyStatus.down) {
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
        worldGroundVel = this.pointVel(worldWheelOffset);
        relativeGroundSpeed = this.worldToRelative(worldGroundVel);
        relativeResponseForce = this.wheels[i].calculateForce(relativeGroundSpeed, delta);
        worldResponseForce = this.relativeToWorld(relativeResponseForce);

        this.addForce(worldResponseForce, worldWheelOffset);
      }

      game.map.keepInView(this);
    };

    // this.postMove = function (delta) {
    // };

    this.collision = function (other) {
      this.collided = true;
    };

  };
  Car.prototype = new RigidBody();

  return Car;
});
