// Wheel

define(["matrix"], function (Matrix) {

  var matrix    = new Matrix(2, 3);

  var Wheel = function (posx, posy, radius) {
    this.position = new Vector(posx, posy);
    this.radius   = radius;

    this.speed      = 0.0;

    this.forwardAxis = new Vector(0, 0);
    this.sideAxis    = new Vector(0, 0);
    this.torque      = 0.0;
    this.inertia     = radius * radius; // fake

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
      responseForce = sideVel.multiply(-10.0).subtract(forwardVel);

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

  return Wheel;

});

