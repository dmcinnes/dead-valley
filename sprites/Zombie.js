define(["sprite", "collidable", "game", "fx/BulletHit", "fx/BloodSplatter"],
       function (Sprite, collidable, game, BulletHit, BloodSplatter) {

  var context = game.spriteContext;

  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var SPEED                          = 11; // 5 MPH
  var WALKING_ANIMATION_FRAME_RATE   = 0.3; // in seconds
  var ATTACKING_ANIMATION_FRAME_RATE = 0.25; // in seconds
  var DYING_ANIMATION_FRAME_RATE     = 0.25; // in seconds
  var DAMAGE_WINDOW                  = 0.05; // in seconds
  var SCAN_TIMEOUT_RESET             = 1; // in seconds
  var MAX_WAIT_TIME                  = 20; // in seconds
  var MAX_RANGE                      = 400; // how far a Zombie can see - in pixels
  var WANDER_DISTANCE                = 200; // how far a Zombie wanders in one direction - in pixels
  var HEALTH                         = 6;

  var BODY_OFFSET = 231;
  var BODY_WIDTH  = 29;

  // from center
  var HEAD_OFFSET = {
    x: -3,
    y: -5
  };

  var HEADSHOT_RADIUS = 2;

  var bulletHit = new BulletHit({
    color:     'green',
    minLength: 10,
    range:     15,
    size:      2
  });

  var headshotBulletHit = new BulletHit({
    color:     'green',
    minLength: 15,
    range:     20,
    size:      2
  });

  var Zombie = function () {
    this.init('Zombie');

    // set some counters randomly so not all zombies are in sync

    this.target                = null;
    this.targetSprite          = null;
    this.seeTarget             = false;
    this.direction             = RIGHT;
    this.walking               = false;
    this.walkingFrame          = 0;
    this.walkingFrameCounter   = WALKING_ANIMATION_FRAME_RATE * Math.random();
    this.attackingFrame        = 0;
    this.attackingFrameCounter = 0;
    this.scanTimeout           = SCAN_TIMEOUT_RESET * Math.random();
    this.waitTimeout           = MAX_WAIT_TIME * Math.random();

    this.currentState          = this.states.wandering;

    this.mass                  = 0.001;
    this.inertia               = 1;

    this.health                = HEALTH;

    this.originalCenterX       = this.center.x;
  };
  Zombie.prototype = new Sprite();

  // draw the 'dead' zombie
  Zombie.prototype.drawBody = function () {
    if (this.direction) {
      context.save();
      context.scale(-1, 1);
    }
    context.drawImage(this.image,
                      BODY_OFFSET,
                      this.imageOffset.y,
                      BODY_WIDTH,
                      this.tileHeight,
                      -this.center.x,
                      -this.center.y,
                      BODY_WIDTH,
                      this.tileHeight);
    if (this.direction) {
      context.restore();
    }
  };

  Zombie.prototype.draw = function (delta) {
    // hack so the sprite is placed correctly when its flipped
    this.center.x = (this.direction == RIGHT) ? this.originalCenterX : this.originalCenterX - 4;

    if (this.health <= 0) {
      // reusing the walking frame and counter
      if (this.walkingFrameCounter < 0.5) {
        this.walkingFrameCounter += delta;
        this.drawTile(10, this.direction);
      } else {
        this.drawBody();
      }
      return;
    }

    if (this.walking) {
      this.walkingFrameCounter += delta;
      if (this.walkingFrameCounter > WALKING_ANIMATION_FRAME_RATE) {
        this.walkingFrameCounter = 0;
        this.walkingFrame = (this.walkingFrame + 1) % 4; // four frames
      }
      this.drawTile(this.walkingFrame+1, this.direction); // starts at 1
    } else {
      this.drawTile(0, this.direction); // standing
    }
    
    // arms
    if (this.currentState === this.states.attacking ||
        this.attackingFrame > 0) {  // want to finish his animation
      this.attackingFrameCounter += delta;
      if (this.attackingFrameCounter > ATTACKING_ANIMATION_FRAME_RATE) {
        this.attackingFrameCounter = 0;
        this.attackingFrame = (this.attackingFrame + 1) % 4; // four frames
      }
      this.drawTile(this.attackingFrame+6, this.direction); // starts at 6
    } else if (this.walking) {
      this.drawTile(6, this.direction); // walking arms
    } else {
      this.drawTile(5, this.direction); // standing arms
    }
  };

  Zombie.prototype.lookForTargets = function () {
    this.seeTarget = false;
    // dude is the only target for now
    // TODO limit the distance the zombie can see
    var target = game.dude.driving || game.dude;
    if (target && target.visible) {
      var see = false;
      game.map.rayTrace(this.pos, target.pos, MAX_RANGE, function (collision, sprite) {
	if (sprite === target) {
	  see = true;
	}
      });
      if (see) {
	this.target       = target.pos.clone();
	this.targetVel    = target.vel.clone();
	this.seeTarget    = true;
	this.targetSprite = target;
      }
    }
  };

  Zombie.prototype.clearTarget = function () {
    this.target       = null;
    this.targetSprite = null;
    this.targetVel    = null;
    this.seeTarget    = false;
  };

  Zombie.prototype.preMove = function (delta) {
    if (this.health <= 0) {
      return;
    }

    this.scanTimeout -= delta;
    if (this.scanTimeout < 0) {
      this.scanTimeout = SCAN_TIMEOUT_RESET;
      this.lookForTargets();
    }

    if (this.seeTarget) {
      this.currentState = this.states.stalking;
    }

    this.currentState.call(this, delta);

    if (this.vel.x) {
      this.direction = (this.vel.x > 0) ? RIGHT : LEFT;
    }
  };

  Zombie.prototype.collision = function (other, point, vector, vab) {
    // zombies don't rotate
    this.pos.rot = 0;
    this.vel.rot = 0;
    
    if (other === game.dude ||
        other === game.dude.driving) {
      this.currentState = this.states.attacking;

      // are we in the window of opportunity?
      if (this.attackingFrame === 3 && // arm stretched
          this.attackingFrameCounter > ATTACKING_ANIMATION_FRAME_RATE - DAMAGE_WINDOW) {
        other.takeDamage(1);
      }
    }
    var magnitude = vab.magnitude();
    if (magnitude > 132) { // 30 MPH
      this.takeDamage(Math.floor(magnitude / 88)); // every 20 MPH
    }
  };

  Zombie.prototype.moveToward = function (pos) {
    var mosey = pos.subtract(this.pos).normalize().scale(SPEED);
    this.vel.set(mosey);
  };

  Zombie.prototype.states = {
    waiting: function (delta) {
      this.walking = false;
      this.vel.scale(0);

      this.waitTimeout -= delta;
      if (this.waitTimeout < 0) {
        // reset wait period
        this.waitTimeout = MAX_WAIT_TIME * Math.random();
        this.currentState = this.states.wandering;
      }
    },
    wandering: function () {
      this.walking = true;

      // create a random target to shoot for
      var direction = new Vector(Math.random() * 360);
      this.target = this.pos.add(direction.scale(Math.random() * WANDER_DISTANCE));

      this.currentState = this.states.searching;
    },
    searching: function () {
      this.walking = true;

      if (this.target) {
        var distance = this.target.subtract(this.pos).magnitude();
        if (distance > 5) {
          this.moveToward(this.target);
        } else {
          // got to the target
          this.target = null;
          this.vel.scale(0);
        }
      } else if (this.targetVel) {
        // move in the last direction seen for a bit
        this.target = this.targetVel.normalize().scale(300).translate(this.pos);
        this.targetVel = null;
      } else {
        this.currentState = this.states.waiting;
      }
    },
    stalking: function () {
      var mosey = this.target.subtract(this.pos).normalize().scale(SPEED);
      this.vel.set(mosey);
      this.walking = true;

      if (!this.seeTarget) {
        this.currentState = this.states.searching;
      }
    },
    attacking: function () {
      this.vel.scale(0);
      this.walking = false;
    },
    thriller: function () {
      // TODO hehe yes
    }
  };

  Zombie.prototype.bulletHit = function (hit, damage) {
    // find distance to gunshot vector from center of head
    var head = this.pos.add(HEAD_OFFSET);
    var vec = hit.point.subtract(head);
    var headNormal = hit.normal.normal();
    var dot = headNormal.dotProduct(vec);
    var distance = Math.abs(dot) / Math.abs(headNormal.magnitude());

    if (distance < HEADSHOT_RADIUS) {
      // HEADSHOT!
      // 3 times more damaging
      this.takeDamage(damage * 3);
      hit.point = head;
      headshotBulletHit.fireSparks(hit);
    } else {
      this.takeDamage(damage);
      bulletHit.fireSparks(hit);
    }

  };

  Zombie.prototype.takeDamage = function (damage) {
    if (this.health > 0) {
      // splat zombie blood at his feet
      var splatPos = this.pos.clone().translate({x:0, y:4});
      BloodSplatter.splat(splatPos, 'green', damage);
      this.health -= damage;
      if (this.health <= 0) {
        // DEEEEEED
        this.vel.scale(0);
        this.walkingFrameCounter = 0;
        this.collidable = false;
        this.shouldSave = false;
        this.z--; // always underfoot
      }
    }
  };

  Zombie.prototype.saveMetadata = function () {
    var metadata = Sprite.prototype.saveMetadata.call(this);
    metadata.health = this.health;
    return metadata;
  };

  collidable(Zombie);

  return Zombie;
});
