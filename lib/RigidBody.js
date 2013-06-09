// Rigid Body
// for physics simulation

define(["Sprite", "Vector"], function (Sprite, Vector) {

  var RigidBody = function () {};
  RigidBody.prototype = new Sprite();

  RigidBody.prototype.isRigidBody = true;

  RigidBody.prototype.init = function (name) {
    Sprite.prototype.init.call(this, name);
    this.forces = Vector.create(0, 0, true);
    this.mass = 1;
    this.torque = 0;
  };

  // override Sprite's integrate function
  RigidBody.prototype.integrate = function (delta) {
    // linear
    // acc, vel and pos are in pixels
    // there are 10 pixels to a meter
    this.acc.x = 10 * this.forces.x / this.mass;
    this.acc.y = 10 * this.forces.y / this.mass;
    this.vel.x += this.acc.x * delta;
    this.vel.y += this.acc.y * delta;
    this.pos.x += this.vel.x * delta;
    this.pos.y += this.vel.y * delta;

    this.forces.x = this.forces.y = 0; // clear forces

    // angular
    this.acc.rot = this.torque / this.inertia;
    this.vel.rot += this.acc.rot * delta;
    this.pos.rot += this.vel.rot * delta;

    this.torque = 0; // clear torque

    this.pos.rot = Math.round(this.pos.rot);

    this.clearCurrentPointsAndNormals();
    this.updateGrid();
  };

  RigidBody.prototype.addForce = function (vector, offset) {
    this.forces.translate(vector);
    this.torque += offset.crossProduct(vector);
  };

  return RigidBody;
});

