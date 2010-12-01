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
      this.inertia = (1.0 / 12.0) *
                     point.x * point.x *
                     point.y * point.y *
                     mass;
    };

    // override Sprite's move function
    this.move = function (delta) {
      if (!this.visible) return;

      if (this.preMove) {
        this.preMove(delta);
      }

      // linear
      this.acc.x = this.forces.x / this.inertia;
      this.acc.y = this.forces.y / this.inertia;
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

      if (this.postMove) {
        this.preMove(delta);
      }
    };

    this.addForce = function (fx, fy, offsetx, offsety) {
      this.forces.x += fx;
      this.forces.y += fy;
      // cross product offset vector X force vector
      this.torque += fx * offsety - fy * offsetx;
    };
  };
  RigidBody.prototype = new Sprite();

  return RigidBody;
});

