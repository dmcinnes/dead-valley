// Wheel

define(["Vector", "Matrix"], function (Vector, Matrix) {

  var matrix    = new Matrix(2, 3);

  //foward vector
  var forwardVector  = Vector.create(0, -1, true);
  var sideVector     = Vector.create(1,  0, true);

  var Wheel = function (posx, posy, radius) {
    this.position      = Vector.create(posx, posy, true);
    this.radius        = radius;

    this.speed         = 0.0;

    this.responseForce = Vector.create(0, 0, true);
    this.forwardAxis   = Vector.create(0, 0, true);
    this.sideAxis      = Vector.create(0, 0, true);
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
    this.brakes = value;
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
    this.responseForce.set(sideVel.multiply(-40).subtract(forwardVel));

    // calculate torque on wheel
    this.torque += diff.dotProduct(this.forwardAxis) * this.radius;
    // add fake friction
    // if (this.torque) {
    //   this.torque -= this.torque * delta / this.torque;
    // }
 
    if (this.brakes && this.speed) {
      this.torque += -this.speed * this.brakes / this.speed;
      this.lastBrakes = this.brakes;
    }

    if (this.brakes === 0 && this.lastBrakes) {
      // reset speed so we don't fly backwords
      this.lastBrakes = 0;
      this.speed = 0;
    } else {
      // integrate total torque into wheel
      this.speed += (this.torque / this.inertia) * delta;
    }

    // clear our transmission torque accumulator
    this.torque = 0;

    // clear current brakes
    this.brakes = 0;

    // return force acting on body
    return this.responseForce;
  };

  return Wheel;

});

