// Rigid Body
// for physics simulation

define(["game", "sprite", "vector"], function (game, Sprite, Vector) {

  var RigidBody = function () {
    this.forces = new Vector(0.0, 0.0);
    this.mass = 1.0;
    this.torque = 0.0;
    this.inertia = 1.0;

    this.setMass = function (mass) {
      this.mass = mass;
      // points[0] and points[1] are the x and y of
      // the first point of the sprite
      // TODO still assuming this is a box
      var point = this.points[0];
      // this.inertia = (point.x * point.x *
      //                 point.y * point.y *
      //                 mass) /
      //                 12.0;
      this.inertia = 80;
    };

    // override Sprite's move function
    this.move = function (delta) {
      if (!this.visible) return;

      if (this.preMove) {
        this.preMove(delta);
      }

      // linear
      this.acc.x = this.forces.x / this.mass;
      this.acc.y = this.forces.y / this.mass;
      this.vel.x += this.acc.x * delta;
      this.vel.y += this.acc.y * delta;
      this.pos.x += this.vel.x * delta;
      this.pos.y += this.vel.y * delta;

      // console.log('forces', this.forces.x, this.forces.y);
      // console.log('acc', this.acc.x, this.acc.y);
      // console.log('vel', this.vel.x, this.vel.y);

      this.forces.x = this.forces.y = 0.0; // clear forces

      // angular
      this.acc.rot = this.torque / this.inertia;
      this.vel.rot += this.acc.rot * delta;
      this.pos.rot += this.vel.rot * delta;

      // console.log('torque', this.torque);
      // console.log('acc.rot', this.acc.rot);
      // console.log('vel.rot', this.vel.rot);
      // console.log('pos.rot', this.pos.rot);
      // console.log('---');

      this.torque = 0.0; // clear torque

      if (this.pos.rot > 360) {
        this.pos.rot -= 360;
      } else if (this.pos.rot < 0) {
        this.pos.rot += 360;
      }

      if (this.postMove) {
        this.postMove(delta);
      }
    };

    this.addForce = function (vector, offset) {
      this.forces.translate(vector);
      this.torque += offset.crossProduct(vector);
    };
  };
  RigidBody.prototype = new Sprite();

  return RigidBody;
});

