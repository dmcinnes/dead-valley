define(["Vector", "Sprite", "Collidable", "Game", "fx/BulletHit", "fx/BloodSplatter", "fx/Audio", "Reporter"],
       function (Vector, Sprite, Collidable, Game, BulletHit, BloodSplatter, Audio, Reporter) {

  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var MIN_SPEED                      = 11;   // 5 MPH
  var MAX_SPEED                      = 55;   // 25 MPH
  var WALKING_ANIMATION_FRAME_RATE   = 2;    // in pixels
  var ATTACKING_ANIMATION_FRAME_RATE = 0.10; // in seconds
  var DYING_ANIMATION_FRAME_RATE     = 0.25; // in seconds
  var DAMAGE_WINDOW                  = 0.02; // in seconds
  var SCAN_TIMEOUT_RESET             = 1;    // in seconds
  var MAX_WAIT_TIME                  = 20;   // in seconds
  var DEAD_BODY_LIFE                 = 45;   // in seconds
  var DEAD_BODY_FADE                 = 5;    // in seconds
  var MAX_RANGE                      = 400;  // how far a Zombie can see - in pixels
  var WANDER_DISTANCE                = 200;  // how far a Zombie wanders in one direction - in pixels
  var HEALTH                         = 6;

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

    this.tireTrackLength       = 30;

    this.prone                 = false;

    this.originalCenterX       = this.center.x;

    this.moseySpeed  = MIN_SPEED + Math.random();
    this.attackSpeed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  };
  Zombie.prototype = new Sprite();

  Zombie.prototype.isZombie = true;

  // draw the 'dead' zombie
  Zombie.prototype.modifyForPronePosition = function () {
    // so we render correctly
    this.node.width(30);
    this.imageOffset.x  = 10;
    this.center.y      -= 6;
    this.pos.y         -= 6;
  };

  Zombie.prototype.draw = function (delta) {
    // hack so the sprite is placed correctly when its flipped
    this.center.x = (this.direction == RIGHT) ? this.originalCenterX : this.originalCenterX + 4;

    if (this.health <= 0) {
      // reusing the walking frame and counter
      if (this.walkingFrameCounter < 0.5) {
        this.walkingFrameCounter += delta;
        this.drawTile(10, 0);
      } else {
        if (!this.prone) {
          this.prone = true;
          this.modifyForPronePosition();
        }
        this.drawTile(11, 0);
        // fade away
        if (DEAD_BODY_LIFE - this.waitTimeout < DEAD_BODY_FADE) {
          this.opacity = 1 - (DEAD_BODY_FADE - DEAD_BODY_LIFE + this.waitTimeout) / DEAD_BODY_FADE;
        }
      }
      return;
    }

    if (this.walking) {
      this.walkingFrameCounter += delta * this.vel.magnitude();
      if (this.walkingFrameCounter > WALKING_ANIMATION_FRAME_RATE) {
        this.walkingFrameCounter = 0;
        this.walkingFrame = (this.walkingFrame + 1) % 4; // four frames
      }
      this.drawTile(this.walkingFrame+1, 0); // starts at 1
    } else {
      this.drawTile(0, 0); // standing
    }
    
    // arms
    if (this.currentState === this.states.attacking ||
        this.attackingFrame > 0) {  // want to finish his animation
      this.attackingFrameCounter += delta;
      if (this.attackingFrameCounter > ATTACKING_ANIMATION_FRAME_RATE) {
        this.attackingFrameCounter = 0;
        this.attackingFrame = (this.attackingFrame + 1) % 4; // four frames
      }
      this.drawTile(this.attackingFrame+6, 1); // starts at 6
    } else if (this.walking) {
      this.drawTile(6, 1); // walking arms
    } else {
      this.drawTile(5, 1); // standing arms
    }
  };

  Zombie.prototype.lookForTargets = function () {
    // dude is the only target for now
    if (!Game.dude) {
      return;
    }
    this.seeTarget = false;
    var target = Game.dude.driving || Game.dude;
    if (target &&
        target.visible &&
        this.pos.subtract(target.pos).magnitude() < MAX_RANGE) {
      var see = false;
      Game.map.rayTrace(this.pos, target.pos, MAX_RANGE, function (collision, sprite) {
        if (sprite === target) {
          see = true;
        }
       
        // look past other zombies
        // keep going if there isn't a collision
        // stop if you see the dude
        return sprite.isZombie || !collision || see;
      });
      if (see) {
        // only make the 'see' noise if the zombie didn't already see the dude
        if (this.currentState !== this.states.stalking) {
          Audio['zombie-see'].playRandom();
        }

        this.setTarget(target);
      }
    }
  };

  Zombie.prototype.setTarget = function (target) {
    this.target       = target.pos.clone();
    this.target.retain();
    this.targetVel    = target.vel.clone();
    this.targetVel.retain();
    this.seeTarget    = true;
    this.targetSprite = target;
  };

  Zombie.prototype.clearTarget = function () {
    this.target       = null;
    this.targetSprite = null;
    this.targetVel    = null;
    this.seeTarget    = false;
  };

  Zombie.prototype.preMove = function (delta) {
    if (this.health <= 0) {
      this.waitTimeout += delta;
      if (this.waitTimeout > DEAD_BODY_LIFE) {
        this.die();
      }
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

  Zombie.prototype.postMove = function (delta) {
    if (!this.audioPlaying &&
        this.attackingFrame === 3) { // arm stretched
      this.audioPlaying = true;
      Audio['zombie-attack'].playRandom();
    } else if (this.attackingFrame === 0) {
      this.audioPlaying = false;
    }
  };

  Zombie.prototype.hit = function (other) {
    // are we in the window of opportunity?
    if (this.attackingFrame === 3 && // arm stretched
        other.takeDamage &&          // can take damage
        this.attackingFrameCounter > ATTACKING_ANIMATION_FRAME_RATE - DAMAGE_WINDOW) {

      var which = (this.direction === RIGHT) ? 1 : -1;
      var add = Vector.create(which * this.tileWidth, 0);
      other.takeDamage(1, this.pos.add(add), this);
    }
  };

  Zombie.prototype.findEndOfObstacle = function (obstacle, point, normal) {
    var parallel = normal.normal();
    var dot = parallel.dotProduct(this.vel);
    var newDir = parallel.scale(dot).normalize();
    // which of the obstacle's points is closest in line which the direction
    // we want to go?
    var points = obstacle.transformedPoints();
    var length = points.length;
    var i, dot, max = 0;
    var point, testPoint;
    for (i = 0; i < length; i++) {
      testPoint = points[i].subtract(obstacle.pos);
      dot = testPoint.dotProduct(newDir);
      max = Math.max(max, dot);
      if (dot === max) {
        point = testPoint;
      }
    }
    var extra = point.clone().normalize().scale(20);
    newDir.scale(20);

    // new target
    this.target = point.add(extra).translate(newDir).translate(obstacle.pos);
    this.target.retain();
  };

  Zombie.prototype.collision = function (other, point, normal, vab) {
    // zombies don't rotate
    this.pos.rot = 0;
    this.vel.rot = 0;

    // ignore inventory drops
    if (other.touchOnly) {
      return;
    }

    var dude = Game.dude;
    if (dude && // make sure the dude is alive and well
        (other === dude ||
         other === dude.driving ||
         (other === dude.inside &&
          this.currentState === this.states.pounding))) {
      this.currentState = this.states.attacking;

      this.hit(other);
    } else if (this.currentState !== this.states.attacking &&
               !other.isZombie &&
               this.vel.dotProduct(normal) < 0) {
      this.lastState = this.currentState;
      this.lastTarget = this.target;
      this.currentState = this.states.avoiding;
      this.findEndOfObstacle(other, point, normal);
    }

    var magnitude = vab.magnitude();
    if (magnitude > 132) { // 30 MPH
      this.takeDamage(Math.floor(magnitude / 88), point, other); // every 20 MPH
    }
  };

  Zombie.prototype.moveToward = function (pos, speed) {
    var mosey = pos.subtract(this.pos).normalize().scale(speed || this.moseySpeed);
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
      if (this.target) {
        this.target.free();
      }
      var direction = Vector.create(Math.random() * 360);
      this.target = this.pos.add(direction.scale(Math.random() * WANDER_DISTANCE));
      this.target.retain();

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
          this.target.free();
          this.target = null;
          this.vel.scale(0);
        }
      } else if (this.targetVel) {
        // move in the last direction seen for a bit
        this.target = this.targetVel.normalize().scale(300).translate(this.pos);
        this.target.retain();
        this.targetVel = null;
      } else {
        this.currentState = this.states.waiting;
      }
    },
    avoiding: function () {
      this.walking = true;

      if (this.target) {
        var distance = this.target.subtract(this.pos).magnitude();
        if (distance > 5) {
          var speed = (this.lastState == this.states.stalking) ? this.attackSpeed : this.moseySpeed;
          this.moveToward(this.target, speed);
        } else {
          // got to the target
          this.target       = this.lastTarget;
          this.lastTarget   = null;
          this.currentState = this.lastState || this.states.waiting;
          this.lastState    = null;
        }
      } else {
        this.currentState = this.states.waiting;
      }
    },
    stalking: function () {
      this.walking = true;

      if (!this.target) {
        this.currentState = this.states.searching;
        return;
      }

      var distance = this.target.subtract(this.pos).magnitude();
      if (distance > 5) {
        this.moveToward(this.target, this.attackSpeed);
      } else {
        // got to the target
        this.target.free();
        this.target = null;
        this.currentState = this.states.searching;
      }

      if (this.targetSprite.inside) {
        this.currentState = this.states.pounding;
      }
    },
    pounding: function () {
      if (this.targetSprite.inside) {
        this.moveToward(this.targetSprite.inside.pos, this.attackSpeed);
      } else {
        this.currentState = this.states.stalking;
      }
    },
    attacking: function () {
      if (Game.dude.inside) {
        this.hit(Game.dude.inside);
      }
      this.vel.scale(0);
      this.walking = false;
    },
    thriller: function () {
      // TODO hehe yes
    }
  };

  Zombie.prototype.bulletHit = function (hit, damage, firearm) {
    var vec = hit.point.subtract(this.pos);

    if (vec.y < -7 &&            // in the area of the head
        Math.abs(vec.x) === 10) { // only from the sides

      // HEADSHOT!
      // 5-10 times more damaging
      var scale = Math.round(5 + Math.random() * 5);
      this.takeDamage(damage * scale, hit.point, firearm);
      headshotBulletHit.fireSparks(hit);
    } else {
      this.takeDamage(damage, hit.point, firearm);
      bulletHit.fireSparks(hit);
    }
  };

  Zombie.prototype.takeDamage = function (damage, pos, other) {
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
        this.z = 99; // always underfoot (starts between 100 and 200)
        // set the points for the now prone zombie
        this.points = [
          Vector.create(-15, 0, true),
          Vector.create( 15, 0, true),
          Vector.create( 15, 9, true),
          Vector.create(-15, 9, true)
        ];
        // reusing waitTimeout
        this.waitTimeout = 0;

        var reason = null;
        if (other) {
          var inhead = (damage > other.damage) ? 'in the head ' : '';
          if (other.isFirearm) {
            reason = 'shot ' + inhead + 'by a ' + other.description;
          } else if (other.clazz === 'BaseballBat') {
            reason = 'smashed ' + inhead + 'with a baseball bat';
          } else if (other.isCar) {
            reason = 'run over by a ';
            if (!other.driver) {
              reason += 'runaway ';
            }
            if (other.color) {
              reason += other.color + ' ';
            }
            reason += other.name;
          } else if (other.name === 'Barrel') {
            reason = 'run over by a barrel';
          } else if (other.name === 'Explosion') {
            if (other.originObject) {
              reason = 'blown away by an exploding ' + other.originObject.name;
            } else {
              reason = 'exploded';
            }
          }
        } else if (damage === 999) {
          reason = 'utterly destroyed by supernatural forces (cheater!)';
        }

        if (!reason) {
          reason = 'dispatched by unknown causes!';
        }

        Reporter.zombieDeath(reason);
      }
    }
  };

  Zombie.prototype.saveMetadata = function () {
    var metadata = Sprite.prototype.saveMetadata.call(this);
    metadata.health = this.health;
    return metadata;
  };

  Collidable(Zombie);

  Game.events.subscribe('firearm discharged,explosion', function () {
    // wake up all the zombies
    _.each(Game.sprites, function (sprite) {
      if (sprite.isZombie) {
        sprite.setTarget(Game.dude);
      }
    });
  });

  return Zombie;
});
