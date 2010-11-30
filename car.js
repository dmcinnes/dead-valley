// Car

define(["game", "sprite"], function (game, RigidBody, Matrix) {

  var keyStatus = game.controls.keyStatus;
  var context   = game.spriteContext;
  var matrix    = new Matrix(2, 3);

  var Wheel = function (posx, posy, radius) {
    this.position = {
      x: posx,
      y: posy
    };

    var forwardAxis = [0, 0];
    var sideAxis    = [0, 0];
    var torque      = 0.0;
    var speed       = 0.0;
    var inertia     = 0.0;

    this.setSteeringAngle = function (angle) {
      matrix.configure(angle, 1.0, 0, 0);

      forwardAxis = matrix.multiply(0.0, 1.0, 1); 
      sideAxis    = matrix.multiply(-1.0, 0.0, 1); 
    };

    this.addTransmissionTorque = function (newValue) {
      torque += newValue;
    };

    var patchSpeedX, patchSpeedY, diffX, diffY, forwardMag;
    this.calculateForce = function (groundSpeedX, groundSpeedY, delta) {
      //calculate speed of tire patch at ground
      patchSpeedX = forwardAxis[0] * speed * radius;
      patchSpeedY = forwardAxis[1] * speed * radius;

      //get velocity difference between ground and patch
      diffX = groundSpeedX + patchSpeedX;
      diffY = groundSpeedY + patchSpeedY;

      //project ground speed onto side axis
      forwardMag = 0.0;
      Vector sideVel = velDifference.Project(m_sideAxis);
      Vector forwardVel = velDifference.Project(m_forwardAxis, out forwardMag);

      //calculate super fake friction forces
      //calculate response force
      Vector responseForce = -sideVel * 2.0f;
      responseForce -= forwardVel;

      //calculate torque on wheel
      m_wheelTorque += forwardMag * m_wheelRadius;

      //integrate total torque into wheel
      m_wheelSpeed += m_wheelTorque / m_wheelInertia * timeStep;

      //clear our transmission torque accumulator
      m_wheelTorque = 0;

      //return force acting on body
      return responseForce;
  }
  };

  var Car = function (name, points, image, tileWidth, tileHeight) {
    var rad, rot;

    this.init(name, points, image, tileWidth, tileHeight);
    this.setMass(5.0); // units?

    this.speed = 0.0;

    this.collided = false;

    this.breaking = false;
    this.driver = null;

    this.acceleration    = 150;
    this.deceleration    = 300;  // breaks!
    this.topSpeed        = 440;  // tops out at 100mph
    this.topReverseSpeed = -132; // reverse at 30mph
    this.topRotation     = 120;

    this.collidesWith = ['car'];

    this.draw = function () {
      if (!this.visible) return;

      if (this.collided) {
        this.collided = false;
        context.fillRect(this.points[0],
                         this.points[1],
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

    // override move
    this.move = function (delta) {
      if (!this.visible) return;

      this.vel.rot = 0;

      if (this.driver) {
        if (keyStatus.left || keyStatus.right) {
          rot = this.speed;
          if (rot > this.topRotation) rot = this.topRotation;
          this.vel.rot = rot * delta * (keyStatus.left ? -1 : 1);
        }
        this.rot += this.vel.rot;

        if (keyStatus.up) {
          this.speed += delta * this.acceleration;
          this.breaking = false;
        } else if (keyStatus.down) {
          if (this.speed > 1.0) { // breaking
            this.breaking = true;
            this.speed -= delta * this.deceleration;
            if (this.speed < 1.0) this.speed = 0.0;
          } else if (this.speed <= 1.0 && !this.breaking) {
            this.speed -= delta * this.acceleration;
          } else {
            this.speed = 0.0;
          }
        } else {
          // friction!
          this.speed += delta * 10 * (this.speed > 0) ? -1 : 1;
          this.breaking = false;
        }
      } else {
        // friction!
        if (this.speed != 0.0) {
          this.speed += delta * 10 * (this.speed > 0) ? -1 : 1;
        }
        // TODO clean this up
      }

      if (this.speed > this.topSpeed) this.speed = this.topSpeed;
      if (this.speed < this.topReverseSpeed) this.speed = this.topReverseSpeed;

      rad = ((this.rot-90) * Math.PI)/180;

      this.vel.x = this.speed * Math.cos(rad) * delta;
      this.vel.y = this.speed * Math.sin(rad) * delta;

      this.x += this.vel.x;
      this.y += this.vel.y;

      if (this.driver) {
        game.map.keepInView(this);
      }
    };

    this.collision = function (other) {
      this.collided = true;
    };

  };
  Car.prototype = new RigidBody();

  return Car;
});
