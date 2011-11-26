// Wheel

define(["Matrix"], function (Matrix) {

  var matrix    = new Matrix(2, 3);

  //foward vector
  var forwardVector  = new Vector(0, -1);
  var sideVector     = new Vector(1,  0);

  var Wheel = function (posx, posy, radius) {
    this.position      = new Vector(posx, posy);
    this.radius        = radius;

    this.speed         = 0.0;

    this.responseForce = new Vector(0, 0);
    this.forwardAxis   = new Vector(0, 0);
    this.sideAxis      = new Vector(0, 0);
    this.torque        = 0.0;
    this.inertia       = radius * radius; // fake

    this.setSteeringAngle(0);
  };

  Wheel.prototype.setSteeringAngle = function (angle) {
    matrix.configure(angle, 1.0, 0, 0);

    matrix.vectorMultiply(forwardVector, this.forwardAxis);
    matrix.vectorMultiply(sideVector, this.sideAxis);
  };

  Wheel.prototype.addTransmissionTorque = function (newValue) {
    this.torque += newValue;
  };

  Wheel.prototype.applyBrakes = function (value) {
    if (this.speed) {
      var torque = -this.speed * value / this.speed;
      this.addTransmissionTorque(torque);
    }
  };

  Wheel.prototype.stop = function (value) {
    this.torque = 0;
    this.speed  = 0;
    this.responseForce.set(0, 0);
  };

  Wheel.prototype.calculateForce = function (relativeGroundSpeed, delta) {
    // calculate speed of tire patch at ground
    var patchSpeed = this.forwardAxis.multiply(this.speed * this.radius);

    // get velocity difference between ground and patch
    var diff = relativeGroundSpeed.subtract(patchSpeed);

    // project ground speed onto side and forward axis
    var sideVel    = diff.project(this.sideAxis);
    var forwardVel = diff.project(this.forwardAxis);

    // calculate super fake friction forces
    // calculate response force
    // responseForce = sideVel.multiply(-10.0).subtract(forwardVel);
    this.responseForce = sideVel.multiply(-40.0).subtract(forwardVel);

    // calculate torque on wheel
    this.torque += diff.dotProduct(this.forwardAxis) * this.radius;
    // add fake friction
    // if (this.torque) {
    //   this.torque -= this.torque * delta / this.torque;
    // }

    // integrate total torque into wheel
    this.speed += (this.torque / this.inertia) * delta;

    // clear our transmission torque accumulator
    this.torque = 0.0;

    // return force acting on body
    return this.responseForce;
  };

  return Wheel;

});

