// Rigid Body
// for physics simulation

define(["game", "sprite", "vector"], function (game, Sprite, Vector) {

  var context   = game.spriteContext;

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
      // var point = this.points[0];
      // this.inertia = (point.x * point.x *
      //                 point.y * point.y *
      //                 mass) /
      //                 12.0;

      this.inertia = 80;

      // this.inertia = this.points[0].magnitude() * mass;
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
        this.postMove(delta);
      }
    };

    this.addForce = function (vector, offset) {
      this.forces.translate(vector);
      this.torque += offset.crossProduct(vector);
    };

    this.collision = function (other, point, vector) {
      this.collided = true;

      // rectify the positions
      // TODO scale this based on collision response
      // for each car
      // var rectify = vector.multiply(0.5);
      this.pos.translate(vector);
      // other.pos.translate(rectify.scale(-1));

      var n = vector.normalize();

      var vab = this.pointVel(point.subtract(this.pos)).subtract(other.pointVel(point.subtract(other.pos)));

      // coefficient of restitution (how bouncy the collision is)
      // TODO make this configurable by this individual
      var e = 0.2;

      var ap = point.subtract(this.pos).normal();
      var bp = point.subtract(other.pos).normal();
      var apd = Math.pow(ap.dotProduct(n), 2);
      var bpd = Math.pow(bp.dotProduct(n), 2);

      var dot = vab.dotProduct(n);
      if (dot > 0) {
        return; // moving away from each other
      }

      var j =  -(1 + e) * dot;

      j /= n.multiply(1/this.mass + 1/other.mass).dotProduct(n) +
           apd / this.inertia + bpd / this.inertia;

      this.vel.translate(n.multiply(j  / this.mass));
      other.vel.translate(n.multiply(-j  / other.mass));

      // TODO make all rot into radians
      this.vel.rot += 180 * (ap.dotProduct(n.multiply(j)) / this.inertia) / Math.PI;
      other.vel.rot += 180 * (bp.dotProduct(n.multiply(-j)) / other.inertia) / Math.PI;

      context.save();
      context.translate(-game.map.originOffsetX, -game.map.originOffsetY);
      context.fillRect(point.x-5, point.y-5, 10, 10);
      context.restore();
    };

  };
  RigidBody.prototype = new Sprite();

  return RigidBody;
});

