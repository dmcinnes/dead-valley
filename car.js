// Car

define(["game", "rigidbody", "matrix"], function (game, RigidBody, Matrix) {

  var keyStatus = game.controls.keyStatus;
  var context   = game.spriteContext;
  var matrix    = new Matrix(2, 3);

  var Wheel = function (posx, posy, radius) {
    this.position = new Vector(posx, posy);

    var forwardAxis = new Vector(0, 0);
    var sideAxis    = new Vector(0, 0);
    var torque      = 0.0;
    var speed       = 0.0;
    var inertia     = 0.0;

    //foward vector
    var forwardVector = new Vector( 0, 1);
    var sideVector    = new Vector(-1, 0);

    this.setSteeringAngle = function (angle) {
      matrix.configure(angle, 1.0, 0, 0);

      matrix.vectorMultiply(forwardVector, forwardAxis); 
      matrix.vectorMultiply(sideVector, sideAxis); 
    };

    this.addTransmissionTorque = function (newValue) {
      torque += newValue;
    };

    var patchSpeed, diff, forwardMag, sideVel, forwardVel, responseForce;
    this.calculateForce = function (relativeGroundSpeed, delta) {
      //calculate speed of tire patch at ground
      patchSpeed = forwardAxis.multiply(speed * radius);

      //get velocity difference between ground and patch
      diff = relativeGroundSpeed.subtract(patchSpeed);

      //project ground speed onto side axis
      forwardMag = 0.0;
      sideVel    = diff.project(sideAxis);
      forwardVel = diff.project(forwardAxis); //, out forwardMag);

      //calculate super fake friction forces
      //calculate response force
      responseForce = sideVel.multiply(-2.0).subtract(forwardVel);

      //calculate torque on wheel
      torque += forwardMag * radius;

      //integrate total torque into wheel
      speed += torque / inertia * delta;

      //clear our transmission torque accumulator
      torque = 0;

      //return force acting on body
      return responseForce;
    }
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
      new Wheel(-hw,  hh, 0.5),
      new Wheel( hw,  hh, 0.5),
      new Wheel( hw, -hh, 0.5),
      new Wheel(-hw, -hh, 0.5)
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
      //apply steering angle to front wheels
      this.wheels[0].setSteeringAngle(-steering * this.steeringLock);
      this.wheels[1].setSteeringAngle(-steering * this.steeringLock);
    };

    this.setThrottle = function (throttle) {
      // front wheel drive
      this.wheels[2].addTransmissionTorque(throttle * this.engineTorque);
      this.wheels[3].addTransmissionTorque(throttle * this.engineTorque);
    };

    this.setBrakes = function (brakes) {
      _(this.wheels).each(function (wheel) {
        wheel.AddTransmissionTorque(-wheel.speed * this.brakeTorque * brakes);
      });
    }

    this.preMove = function (delta) {
      if (!this.visible) return;

      if (this.driver) {
        if (keyStatus.left || keyStatus.right) {
          this.setSteering(keyStatus.left ? -1 : 1);
        } else {
          this.setSteering(0);
        }

        if (keyStatus.up) {
          this.setThrottle(1);
          this.breaking = false;
        } else if (keyStatus.down) {
          this.setBreaks(1);
          this.breaking = true;
        }
      }

      for (i = 0; i < 4; i++) {
        // Vector worldWheelOffset = base.RelativeToWorld(wheel.GetAttachPoint());
        // Vector worldGroundVel = base.PointVel(worldWheelOffset);
        // Vector relativeGroundSpeed = base.WorldToRelative(worldGroundVel);
        // Vector relativeResponseForce = wheel.CalculateForce(relativeGroundSpeed, timeStep);
        // Vector worldResponseForce = base.RelativeToWorld(relativeResponseForce);

        this.addForce(wheel[i].calculateForce(relativeGroundSpeed, delta), wheel[i].position);
      }
    };


    this.collision = function (other) {
      this.collided = true;
    };

  };
  Car.prototype = new RigidBody();

  return Car;
});
