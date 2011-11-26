// Rigid Body
// for physics simulation

define(["Sprite", "Vector"], function (Sprite, Vector) {

  var RigidBody = function () {
    this.forces = new Vector(0.0, 0.0);
    this.mass = 1.0;
    this.torque = 0.0;
    this.inertia = 80;

    // this.setMass = function (mass) {
    //   this.mass = mass;
    //   // points[0] and points[1] are the x and y of
    //   // the first point of the sprite
    //   // TODO still assuming this is a box
    //   // var point = this.points[0];
    //   // this.inertia = (point.x * point.x *
    //   //                 point.y * point.y *
    //   //                 mass) /
    //   //                 12.0;

    //   this.inertia = 80;

    //   // this.inertia = this.points[0].magnitude() * mass;
    // };

    // override Sprite's integrate function
    this.integrate = function (delta) {
      // linear
      // acc, vel and pos are in pixels
      // there are 10 pixels to a meter
      this.acc.x = 10 * this.forces.x / this.mass;
      this.acc.y = 10 * this.forces.y / this.mass;
      this.vel.x += this.acc.x * delta;
      this.vel.y += this.acc.y * delta;
      this.pos.x += this.vel.x * delta;
      this.pos.y += this.vel.y * delta;

      this.forces.x = this.forces.y = 0.0; // clear forces

      // angular
      this.acc.rot = this.torque / this.inertia;
      this.vel.rot += this.acc.rot * delta;
      this.pos.rot += this.vel.rot * delta;

      this.torque = 0.0; // clear torque

      if (this.pos.rot > 360) {
        this.pos.rot -= 360;
      } else if (this.pos.rot < 0) {
        this.pos.rot += 360;
      }
      this.pos.rot = Math.round(this.pos.rot);

      this.clearCurrentPointsAndNormals();
      this.updateGrid();
      this.updateForVerticalZ();
    };

    this.addForce = function (vector, offset) {
      this.forces.translate(vector);
      this.torque += offset.crossProduct(vector);
    };

  };
  RigidBody.prototype = new Sprite();

  RigidBody.prototype.isRigidBody = true;

  return RigidBody;
});

